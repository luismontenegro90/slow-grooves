import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

export function initMotion() {
 const isAlbum=document.body.classList.contains('album-page');
 const albumRevealed=new Set();
 const preference=matchMedia('(prefers-reduced-motion: reduce)');
 const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
 const animations=new Set();
 let lenis;
 const ease='cubic-bezier(.16,1,.3,1)';
 const animate=(element,frames,options)=>{
  const animation=element.animate(frames,{duration:850,easing:ease,...options});
  animations.add(animation);
  animation.finished.catch(()=>{}).finally(()=>animations.delete(animation));
 };
 const reveal=element=>{
  element.classList.remove('motion-pending');
  if(element.dataset.motionSeen==='true')return;
  element.dataset.motionSeen='true';
  if(preference.matches)return;
  if(isAlbum){
   const section=element.dataset.motionSection;
   if(albumRevealed.has(section))return;
   albumRevealed.add(section);
   animate(element,[{opacity:.65},{opacity:1}],{duration:420});
   return;
  }
  const delay=Number(element.dataset.motionDelay||0);
  if(element.classList.contains('motion-heading')){
   element.querySelectorAll('.motion-word').forEach((word,index)=>animate(word,[
    {transform:'translate3d(0,112%,0) rotate(3deg)',opacity:0},
    {transform:'translate3d(0,0,0) rotate(0deg)',opacity:1}
   ],{delay:delay+index*45,duration:1050,fill:'backwards'}));
  }else{
   animate(element,[{opacity:0,transform:'translate3d(0,42px,0)'},{opacity:1,transform:'translate3d(0,0,0)'}],{delay,fill:'backwards'});
   if(element.classList.contains('ritual-scene')){
    const image=element.querySelector('img');
    if(image)animate(image,[{clipPath:'inset(18% 0 0 0)',transform:'scale(1.07)'},{clipPath:'inset(0% 0 0 0)',transform:'scale(1)'}],{delay,duration:1300,fill:'backwards'});
   }
  }
 };
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){reveal(entry.target);observer.unobserve(entry.target);}
 },{threshold:0,rootMargin:'0px 0px -6% 0px'});
 const splitHeading=heading=>{
  if(heading.classList.contains('motion-heading'))return;
  const label=heading.innerText.replace(/\s+/g,' ').trim();
  const wrapper=document.createElement('span');
  wrapper.className='motion-content';
  wrapper.setAttribute('aria-hidden','true');
  while(heading.firstChild)wrapper.append(heading.firstChild);
  heading.append(wrapper);
  heading.setAttribute('aria-label',label);
  const walker=document.createTreeWalker(wrapper,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  for(const node of nodes){
   const fragment=document.createDocumentFragment();
   for(const token of node.textContent.split(/(\s+)/)){
    if(!token)continue;
    if(/^\s+$/.test(token)){fragment.append(document.createTextNode(token));continue;}
    const clip=document.createElement('span');clip.className='motion-clip';
    const word=document.createElement('span');word.className='motion-word';word.textContent=token;
    clip.append(word);fragment.append(clip);
   }
   node.replaceWith(fragment);
  }
  heading.classList.add('motion-heading');
 };
 const prepare=root=>{
  if(preference.matches)return;
  if(isAlbum){
   // Keep titles and embeds intact; fade each complete section only once.
   for(const selector of ['.album-overview','.album-listening','.album-vinyl']){
    root.querySelectorAll(selector).forEach(element=>{
     if(element.dataset.motionSeen)return;
     element.dataset.motionSection=selector;
     if(albumRevealed.has(selector)){element.dataset.motionSeen='true';return;}
     observer.observe(element);
    });
   }
   return;
  }
  root.querySelectorAll('h1,h2,.ritual-scene h3').forEach(heading=>{
   splitHeading(heading);
   if(!heading.dataset.motionSeen)heading.dataset.reveal='';
  });
  root.querySelectorAll('.hero-copy>.eyebrow,.hero-copy>.intro,.hero-copy>.button,.hero-bottom,.hero-video-caption,.ritual>.eyebrow,.ritual>div>p,.ritual aside,.ritual-scene,.section-top>p,.collection-controls,.record-card,.album-art,.album-overview>div>p,.album-tracklist,.album-player,.vinyl-photo-grid figure,.outro>p,footer').forEach(element=>{
   if(element.closest('.ritual-scene') && !element.classList.contains('ritual-scene'))return;
   if(!element.dataset.motionSeen)element.dataset.reveal='';
  });
  root.querySelectorAll('.ritual-scene').forEach((element,index)=>element.dataset.motionDelay=String(index*125));
  const cards=[...root.querySelectorAll('.record-card')];
  cards.forEach((element,index)=>element.dataset.motionDelay=String((index%4)*70));
  root.querySelectorAll('[data-reveal]:not([data-motion-seen])').forEach(element=>{
   element.classList.add('motion-pending');
   observer.observe(element);
  });
 };
 const parallax=()=>{
  const hero=document.querySelector('.hero');
  if(!hero)return;
  const progress=Math.min(1,Math.max(0,scrollY/hero.offsetHeight));
  hero.style.setProperty('--hero-drift',`${progress*55}px`);
 };
 const smooth=()=>{
  if(preference.matches){lenis?.destroy();lenis=undefined;return;}
  if(!lenis){
   lenis=new Lenis({autoRaf:true,lerp:.085,smoothWheel:true,syncTouch:false,anchors:{offset:-30},allowNestedScroll:true});
   lenis.on('scroll',parallax);
  }
 };
 const preferenceChanged=()=>{
  smooth();
  if(preference.matches){
   for(const animation of animations)animation.cancel();
   document.querySelectorAll('.motion-pending').forEach(element=>element.classList.remove('motion-pending'));
   document.querySelector('.hero')?.style.removeProperty('--hero-drift');
  }else prepare(document);
 };
 const focusReveal=event=>{
  const element=event.target.closest?.('.motion-pending');
  if(element){observer.unobserve(element);reveal(element);}
 };
 const tilt=event=>{
  if(preference.matches||!finePointer.matches)return;
  const cover=event.target.closest?.('.record-card .cover');
  if(!cover)return;
  const bounds=cover.getBoundingClientRect();
  const x=(event.clientX-bounds.left)/bounds.width-.5;
  const y=(event.clientY-bounds.top)/bounds.height-.5;
  cover.style.setProperty('--tilt-x',`${-y*7}deg`);
  cover.style.setProperty('--tilt-y',`${x*7}deg`);
 };
 const resetTilt=event=>{
  const cover=event.target.closest?.('.record-card .cover');
  if(cover&&!cover.contains(event.relatedTarget)){cover.style.removeProperty('--tilt-x');cover.style.removeProperty('--tilt-y');}
 };
 const mutations=new MutationObserver(()=>prepare(document));
 document.querySelectorAll('#record-grid,#album-content').forEach(element=>mutations.observe(element,{childList:true}));
 preference.addEventListener('change',preferenceChanged);
 document.addEventListener('focusin',focusReveal);
 document.addEventListener('pointermove',tilt,{passive:true});
 document.addEventListener('pointerout',resetTilt,{passive:true});
 smooth();prepare(document);parallax();
 return ()=>{
  observer.disconnect();mutations.disconnect();lenis?.destroy();
  for(const animation of animations)animation.cancel();
  document.querySelectorAll('.motion-pending').forEach(element=>element.classList.remove('motion-pending'));
  preference.removeEventListener('change',preferenceChanged);
  document.removeEventListener('focusin',focusReveal);
  document.removeEventListener('pointermove',tilt);
  document.removeEventListener('pointerout',resetTilt);
 };
}
