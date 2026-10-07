import {defineField,defineType} from 'sanity';
export const vinyl = defineType({name:'vinyl',title:'Vinyl record',type:'document',fields:[
 defineField({name:'rank',title:'Position in the top 20',type:'number',validation:r=>r.required().integer().min(1).max(20)}),
 defineField({name:'title',title:'Album title',type:'string',validation:r=>r.required()}),
 defineField({name:'artist',title:'Artist',type:'string',validation:r=>r.required()}),
 defineField({name:'slug',title:'Album page URL',type:'slug',options:{source:doc=>`${doc.artist}-${doc.title}`,maxLength:150}}),
 defineField({name:'year',title:'Release year',type:'number',validation:r=>r.required().integer().min(1900).max(2100)}),
 defineField({name:'genre',title:'Genre',type:'string',validation:r=>r.required()}),
 defineField({name:'cover',title:'Album cover',type:'image',options:{hotspot:true},validation:r=>r.required()}),
 defineField({name:'note',title:'Why this record matters to me',description:'Write in English. This appears in the listening notes.',type:'text',rows:5,validation:r=>r.required()}),
 defineField({name:'favoriteTrack',title:'A track to sit with',type:'string'}),
 defineField({name:'spotifyUrl',title:'Spotify album URL',type:'url',validation:r=>r.uri({scheme:['https']}).custom(value=>!value || /^https:\/\/open\.spotify\.com\/album\/[A-Za-z0-9]{22}(?:\?.*)?$/.test(String(value)) || 'Use an official Spotify album URL.')}),
 defineField({name:'tracklistEdition',title:'Tracklist edition',type:'string'}),
 defineField({name:'tracklistSource',title:'Tracklist source',type:'url',validation:r=>r.uri({scheme:['https']})}),
 defineField({name:'tracklist',title:'Tracklist',type:'array',of:[{type:'object',name:'track',fields:[
  defineField({name:'position',title:'Position / vinyl side',type:'string'}),
  defineField({name:'title',title:'Track title',type:'string',validation:r=>r.required()}),
  defineField({name:'duration',title:'Duration (m:ss)',type:'string'})
 ],preview:{select:{title:'title',subtitle:'position'}}}]}),
 defineField({name:'vinylEdition',title:'Photographed vinyl edition',description:'Reference pressing, not necessarily your personal copy.',type:'string'}),
 defineField({name:'vinylPhotos',title:'Physical vinyl photographs',type:'array',of:[{type:'image',name:'vinylPhoto',options:{hotspot:true},fields:[
  defineField({name:'alt',title:'Image description',type:'string',validation:r=>r.required()}),
  defineField({name:'credit',title:'Photo credit',type:'string'}),
  defineField({name:'sourceUrl',title:'Photo source page',type:'url',validation:r=>r.uri({scheme:['https']})})
 ]}]})
],orderings:[{title:'Top 20 order',name:'rankAsc',by:[{field:'rank',direction:'asc'}]}],preview:{select:{title:'title',artist:'artist',rank:'rank',media:'cover'},prepare({title,artist,rank,media}){return {title:`${String(rank||'').padStart(2,'0')} · ${title}`,subtitle:artist,media};}}});
