import {readFile,writeFile} from 'node:fs/promises';
import {getCliClient} from 'sanity/cli';

const client=getCliClient({apiVersion:'2026-06-09'}).withConfig({useCdn:false});
const rows=JSON.parse(await readFile(process.argv[2],'utf8'));
const documents=[];
async function upload(url,filename,sourceUrl='') {
 const response=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0','Referer':sourceUrl},signal:AbortSignal.timeout(45000)});
 if(!response.ok)throw Error(`Image failed: ${filename} (${response.status})`);
 const contentType=response.headers.get('content-type')||'';
 if(!contentType.startsWith('image/'))throw Error(`Invalid image: ${filename}`);
 const asset=await client.assets.upload('image',Buffer.from(await response.arrayBuffer()),{filename,contentType});
 return {_type:'reference',_ref:asset._id};
}
for(const row of rows) {
 if(!row.tracklist?.length||!/^https:\/\/open.spotify.com\/album\/[A-Za-z0-9]{22}$/.test(row.spotifyUrl||''))throw Error(`Incomplete listening details: ${row.title}`);
 const id=`vinyl-${String(row.rank).padStart(2,'0')}`;
 const current=await client.getDocument(id);
 if(current && (current.artist!==row.artist || current.title!==row.title))throw Error(`Position occupied: ${id}`);
 const cover={_type:'image',asset:await upload(row.cover,`${id}-cover.jpg`)};
 const vinylPhotos=[];
 for(const [i,photo] of (row.vinylPhotos||[]).entries()) {
  vinylPhotos.push({_type:'vinylPhoto',_key:`photo-${i+1}`,asset:await upload(photo.url,`${id}-physical-${i+1}.jpg`,photo.sourceUrl),alt:photo.alt,credit:photo.credit,sourceUrl:photo.sourceUrl});
 }
 const slug=`${row.artist}-${row.title}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 documents.push({_id:id,_type:'vinyl',rank:row.rank,title:row.title,artist:row.artist,year:row.year,genre:row.genre,note:row.note,slug:{_type:'slug',current:slug},cover,spotifyUrl:row.spotifyUrl,tracklistEdition:row.tracklistEdition,tracklistSource:row.tracklistSource,vinylEdition:row.vinylEdition,vinylPhotos,tracklist:row.tracklist.map((t,i)=>({_type:'track',_key:`track-${i+1}`,position:String(t.position||i+1),title:t.title,...(t.duration?{duration:t.duration}:{})}))});
 console.log(`Prepared ${id}: ${row.tracklist.length} tracks, ${vinylPhotos.length} physical photos.`);
}
let transaction=client.transaction();
for(const document of documents)transaction=transaction.createOrReplace(document);
await transaction.commit();
const snapshot=await client.fetch('*[_type == "vinyl" && !(_id in path("drafts.**"))] | order(rank asc)[0...20]{_id,"slug":slug.current,rank,title,artist,year,genre,note,favoriteTrack,spotifyUrl,tracklist,tracklistEdition,tracklistSource,vinylEdition,"vinylPhotos":vinylPhotos[]{"url":asset->url,alt,credit,sourceUrl},"cover":cover.asset->url}');
if(snapshot.length!==20)throw Error(`Expected 20 records, found ${snapshot.length}`);
await writeFile('../src/data/records.json',JSON.stringify(snapshot,null,2)+'\n');
console.log(JSON.stringify({albums:snapshot.length,added:documents.length,tracks:snapshot.reduce((sum,r)=>sum+r.tracklist.length,0),photos:snapshot.reduce((sum,r)=>sum+r.vinylPhotos.length,0)}));
