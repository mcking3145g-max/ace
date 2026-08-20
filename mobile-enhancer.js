(()=>{
  document.documentElement.classList.add('ace-mobile');

  const readBookingContext=()=>{
    const hash=location.hash.toLowerCase();
    let service='Gaming PC';
    if(hash.includes('/ps5'))service='PlayStation 5';
    else if(hash.includes('/sim'))service='Sim Racing';

    let players='1 Player';
    const setupText=document.querySelector('#summaryPc')?.textContent?.trim()||'';
    if(/player/i.test(setupText))players=setupText;

    const pack=document.querySelector('#summaryPack')?.textContent?.trim()||'';
    const duration=document.querySelector('#summaryDuration')?.textContent?.trim()||'';
    const details=[pack,duration,setupText].filter(Boolean).join(' • ');

    return {service,players,details};
  };

  const buildBookingUrl=()=>{
    const context=readBookingContext();
    const url=new URL('/book-mobile.html',location.origin);
    url.searchParams.set('service',context.service);
    url.searchParams.set('players',context.players);
    if(context.details)url.searchParams.set('details',context.details);
    return url.pathname+url.search;
  };

  const installMobileBookingRouter=()=>{
    document.addEventListener('click',event=>{
      const trigger=event.target.closest('.mobile-book-link');
      if(!trigger)return;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      document.body.classList.remove('lock');
      location.assign(buildBookingUrl());
    },true);

    document.querySelectorAll('.mobile-book-link').forEach(el=>{
      if(el.tagName==='A')el.setAttribute('href','/book-mobile.html');
      el.setAttribute('aria-label','Open booking page');
    });

    document.querySelector('#bookModal')?.remove();
    document.body.classList.remove('lock');
  };

  const init=()=>{
    installMobileBookingRouter();

    // The hamburger is the only mobile navigation. Remove the old five-button dock.
    document.querySelectorAll('.mobile-dock').forEach(el=>el.remove());
    document.body.style.setProperty('padding-bottom','18px','important');

    const header=document.querySelector('header');
    const menu=document.querySelector('.menu');
    const headerNav=header?.querySelector('nav');

    if(menu){
      menu.setAttribute('aria-label','Open navigation');
      menu.setAttribute('aria-expanded',headerNav?.classList.contains('open')?'true':'false');
      menu.addEventListener('click',()=>{
        requestAnimationFrame(()=>{
          menu.setAttribute('aria-expanded',headerNav?.classList.contains('open')?'true':'false');
        });
      });
    }

    headerNav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{
      headerNav.classList.remove('open');
      menu?.setAttribute('aria-expanded','false');
    }));

    // Tighten the first screen so the hero sits directly under the header.
    const hero=document.querySelector('.hero');
    const heroTitle=hero?.querySelector('h1');
    hero?.style.setProperty('padding-top','calc(var(--mobile-header-h) + env(safe-area-inset-top,0px) + 28px)','important');
    heroTitle?.style.setProperty('font-size','clamp(38px,11.5vw,54px)','important');
    heroTitle?.style.setProperty('line-height','.98','important');

    const footer=document.querySelector('.site-footer, footer');
    if(footer&&!footer.querySelector('.mobile-desktop-link')){
      const a=document.createElement('a');
      a.href='/index.html';
      a.className='mobile-desktop-link';
      a.textContent='View desktop version';
      footer.appendChild(a);
    }

    const setViewport=()=>document.documentElement.style.setProperty('--mobile-vh',`${innerHeight*.01}px`);
    setViewport();
    addEventListener('resize',setViewport,{passive:true});
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();