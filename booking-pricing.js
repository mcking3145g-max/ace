(()=>{
  const money=n=>`₹${Number(n).toLocaleString('en-IN')}`;

  const portalPrices={
    hours:{main:'₹89',meta:'Regular 1 hour • Happy Hour ₹69'},
    days:{main:'₹499',meta:'Half-Day • 8 hours'},
    months:{main:'LONG-TERM',meta:''},
    ps5:{main:'₹99',meta:'30 minutes • 1 controller'},
    vr:{main:'₹149',meta:'15 minutes • all days'},
    sim:{main:'₹299',meta:'30 minutes • Mon–Thu'}
  };

  const pcPrices={
    super:{'1 Hour':99,'3 Hours':279,'5 Hours':449,'8 Hours':679,'30 Hours':2399,'Happy Hour':79},
    premium:{'1 Hour':89,'3 Hours':249,'5 Hours':399,'8 Hours':599,'30 Hours':2099,'Happy Hour':69}
  };
  const ps5Prices={
    '1 Player':{'30 Minutes':99,'1 Hour':129,'2 Hours':239},
    '2 Players':{'30 Minutes':169,'1 Hour':219,'2 Hours':399},
    '3 Players':{'30 Minutes':239,'1 Hour':309,'2 Hours':539},
    '4 Players':{'30 Minutes':299,'1 Hour':399,'2 Hours':699}
  };
  const vrPrices={'15 Minutes':149,'30 Minutes':249,'1 Hour':449};
  const dayPrices={
    'Half Day':{price:499,meta:'8 hours • Half-Day'},
    '1 Day':{price:749,meta:'15 hours • Full-Day'},
    '2 Days':{price:4999,meta:'Ace Elite • 2+ days'},
    'Night Pass':{price:699,meta:'8 hours • Night Pass'}
  };
  const simPrices={
    '30 Minutes':{weekday:299,weekend:349},
    '1 Hour':{weekday:499,weekend:599}
  };
  const simVrPrices={
    '30 Minutes':{weekday:399,weekend:449},
    '1 Hour':{weekday:599,weekend:699}
  };

  const packFromTitle=title=>({
    'Hours Pack':'hours','Day Packs':'days','Month Packs':'months','PS5 Packs':'ps5','VR Packs':'vr','Sim Racing':'sim'
  })[title]||null;

  const getPack=()=>{
    const match=location.hash.match(/^#packages\/(hours|days|months|ps5|vr|sim)/i);
    return match?.[1]?.toLowerCase()||packFromTitle(document.querySelector('#packPageTitle')?.textContent?.trim())||'hours';
  };

  const getPcTier=()=>document.querySelector('#setupOptions [data-pc-tier].active')?.dataset.pcTier||(/premium/i.test(document.querySelector('#summaryPc')?.textContent||'')?'premium':'super');
  const getPlayers=()=>document.querySelector('#setupOptions [data-player-count].active')?.dataset.playerCount||document.querySelector('#summaryPc')?.textContent?.trim()||'1 Player';

  const infoFor=(pack,duration)=>{
    if(pack==='hours'){
      const tier=getPcTier();
      const price=pcPrices[tier]?.[duration];
      if(price)return{main:money(price),meta:`${tier==='super'?'Super':'Premium'} PC${duration==='Happy Hour'?' • limited-time pass':''}`};
    }
    if(pack==='days'&&dayPrices[duration]){
      const x=dayPrices[duration];return{main:money(x.price),meta:x.meta};
    }
    if(pack==='ps5'){
      const players=getPlayers();
      const price=ps5Prices[players]?.[duration];
      if(price)return{main:money(price),meta:`${duration==='30 Minutes'?'All days':'Mon–Thu'} • ${players.replace('Players','controllers').replace('Player','controller')}`};
    }
    if(pack==='vr'&&vrPrices[duration])return{main:money(vrPrices[duration]),meta:'VR Gaming • all days'};
    if(pack==='sim'&&simPrices[duration]){
      const x=simPrices[duration];
      return{main:money(x.weekday),meta:`Mon–Thu • Fri–Sun ${money(x.weekend)}`};
    }
    return{main:'RATE AT COUNTER',meta:'',unknown:true};
  };

  const decoratePortals=()=>{
    document.querySelectorAll('[data-open-pack]').forEach(card=>{
      const type=card.dataset.openPack;
      const data=portalPrices[type];
      if(!data)return;
      let chip=card.querySelector('.ace-pack-price');
      if(!chip){chip=document.createElement('div');chip.className='ace-pack-price';card.appendChild(chip)}
      const label=data.main.startsWith('₹')?'FROM':'PLAN';
      chip.innerHTML=`<span>${label}</span><strong>${data.main}</strong>${data.meta?`<small>${data.meta}</small>`:''}`;
    });
  };

  const ensureExtraButtons=(pack,container)=>{
    const extras={hours:['30 Hours','Happy Hour'],days:['Night Pass'],ps5:['30 Minutes']}[pack]||[];
    extras.forEach(duration=>{
      if(container.querySelector(`[data-duration="${duration}"]`))return;
      const b=document.createElement('button');
      b.className='duration-option';b.type='button';b.dataset.duration=duration;b.dataset.aceExtra='1';b.textContent=duration;
      container.appendChild(b);
    });
  };

  const decorateDurations=()=>{
    const container=document.querySelector('#durationOptions');
    if(!container)return;
    const pack=getPack();
    ensureExtraButtons(pack,container);
    container.querySelectorAll('[data-duration]').forEach(button=>{
      const duration=button.dataset.duration;
      const info=infoFor(pack,duration);
      const sig=[pack,getPcTier(),getPlayers(),duration,info.main,info.meta].join('|');
      if(button.dataset.acePriceSig===sig)return;
      button.dataset.acePriceSig=sig;
      button.classList.add('ace-priced');
      button.innerHTML=`<span class="ace-duration-name">${duration}</span><strong class="ace-duration-price${info.unknown?' unknown':''}">${info.main}</strong>${info.meta?`<small class="ace-duration-meta">${info.meta}</small>`:''}`;
    });

    let notes=document.querySelector('#acePriceNotes');
    if(!notes){notes=document.createElement('div');notes.id='acePriceNotes';notes.className='ace-price-note';container.insertAdjacentElement('afterend',notes)}
    if(pack==='sim'){
      notes.hidden=false;
      notes.innerHTML=`<div class="ace-price-note-card"><span>SIM RACING VR • 30 MIN</span><strong>${money(simVrPrices['30 Minutes'].weekday)} <small>/ Mon–Thu</small></strong><small>Fri–Sun ${money(simVrPrices['30 Minutes'].weekend)} • Extra minute ₹5 / ₹8</small></div><div class="ace-price-note-card"><span>SIM RACING VR • 1 HOUR</span><strong>${money(simVrPrices['1 Hour'].weekday)} <small>/ Mon–Thu</small></strong><small>Fri–Sun ${money(simVrPrices['1 Hour'].weekend)}</small></div>`;
    }else{
      notes.hidden=true;notes.innerHTML='';
    }
  };

  const updateSummary=()=>{
    const summary=document.querySelector('.pack-summary');
    const duration=document.querySelector('#summaryDuration')?.textContent?.trim();
    if(!summary||!duration)return;
    let line=summary.querySelector('.ace-summary-price-line');
    if(!line){
      line=document.createElement('div');line.className='summary-line ace-summary-price-line';
      const setupLine=document.querySelector('#summaryPc')?.closest('.summary-line');
      setupLine?.insertAdjacentElement('afterend',line)||summary.appendChild(line);
    }
    const info=infoFor(getPack(),duration);
    line.innerHTML=`<small>PRICE</small><strong>${info.main}</strong>${info.meta?`<em>${info.meta}</em>`:''}`;
  };

  let queued=false;
  const refresh=()=>{
    queued=false;decoratePortals();decorateDurations();updateSummary();
  };
  const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(refresh)};

  const init=()=>{
    refresh();
    document.addEventListener('click',e=>{
      if(e.target.closest('[data-open-pack],[data-duration],[data-pc-tier],[data-player-count]'))setTimeout(schedule,0);
    },true);
    addEventListener('hashchange',()=>setTimeout(schedule,0));
    const observer=new MutationObserver(schedule);
    ['durationOptions','setupOptions','summaryDuration','summaryPc','packPageTitle'].forEach(id=>{
      const el=document.getElementById(id);if(el)observer.observe(el,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
    });
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();

  // Keep Ace Store navigation in the current tab, even if a link has target="_blank".
  document.addEventListener('click',event=>{
    const link=event.target.closest('a.store-link, a[href$="/rentals.html"]');
    if(!link)return;
    event.preventDefault();
    event.stopPropagation();
    window.location.assign(link.href);
  },true);
})();
