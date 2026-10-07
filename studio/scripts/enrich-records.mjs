import {readFile,writeFile} from 'node:fs/promises';
import {getCliClient} from 'sanity/cli';
const client=getCliClient({apiVersion:'2026-06-09'}).withConfig({useCdn:false});
const file=process.argv[2];
if(!file)throw Error('Pass a verified details JSON file.');
const rows=JSON.parse(await readFile(file,'utf8'));
for(const row of rows){
 const id=`vinyl-${String(row.rank).padStart(2,'0')}`;
 const current=await client.getDocument(id);if(!current)throw Error(`Missing ${id}`);
 const photos=[];
 for(let i=0;i<(row.vinylPhotos||[]).length;i++){
  const photo=row.vinylPhotos[i];const response=await fetch(photo.url,{headers:{'User-Agent':'Mozilla/5.0','Referer':photo.sourceUrl||''},signal:AbortSignal.timeout(45000)});
  if(!response.ok)throw Error(`Photo download failed: ${id}, image ${i+1}`);
  const contentType=response.headers.get('content-type')||'';if(!contentType.startsWith('image/'))throw Error('Non-image response');
  const asset=await client.assets.upload('image',Buffer.from(await response.arrayBuffer()),{filename:`${id}-physical-${i+1}.jpg`,contentType});
  photos.push({_type:'vinylPhoto',_key:`photo-${i+1}`,asset:{_type:'reference',_ref:asset._id},alt:photo.alt,credit:photo.credit,sourceUrl:photo.sourceUrl});
 }
 if(!photos.length)throw Error(`No physical photographs for ${id}`);
 const tracklist=row.tracklist.map((t,i)=>({_type:'track',_key:`track-${i+1}`,position:String(t.position||String(i+1).padStart(2,'0')),title:t.title,...(t.duration?{duration:String(t.duration)}:{})}));
 const slug=`${current.artist}-${current.title}`.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
 await client.patch(id).set({spotifyUrl:row.spotifyUrl,tracklist,tracklistEdition:row.tracklistEdition,tracklistSource:row.tracklistSource,vinylEdition:row.vinylEdition,vinylPhotos:photos}).setIfMissing({slug:{_type:'slug',current:slug}}).commit();
 console.log(`Updated ${id}: ${tracklist.length} tracks, ${photos.length} vinyl photos.`);
}
const snapshot=await client.fetch('*[_type == "vinyl" && !(_id in path("drafts.**"))] | order(rank asc)[0...20]{_id,"slug":slug.current,rank,title,artist,year,genre,note,favoriteTrack,spotifyUrl,tracklist,tracklistEdition,tracklistSource,vinylEdition,"vinylPhotos":vinylPhotos[]{"url":asset->url,alt,credit,sourceUrl},"cover":cover.asset->url}');
await writeFile('../src/data/records.json',JSON.stringify(snapshot,null,2)+'\n');
