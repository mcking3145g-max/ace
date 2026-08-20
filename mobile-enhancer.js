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
    // Capture clicks before any package/button handler can run.
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

    // Mobile never uses the legacy desktop booking modal.
    document.querySelector('#bookModal')?.remove();
    document.body.classList.remove('lock');
  };

  const init=()=>{
    installMobileBookingRouter();

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

    if(!document.querySelector('.mobile-dock')){
      const dock=document.createElement('nav');
      dock.className='mobile-dock';
      dock.setAttribute('aria-label','Mobile quick navigation');
      dock.innerHTML=''
        +'<a href="#home" data-mobile-target="home"><i>⌂</i><span>Home</span></a>'
        +'<a href="#services" data-mobile-target="services"><i>◈</i><span>Explore</span></a>'
        +'<a href="rentals.html"><i>▣</i><span>Rentals</span></a>'
        +'<a href="#contact" data-mobile-target="contact"><i>✦</i><span>Contact</span></a>'
        +'<a href="/index.html"><i>↗</i><span>Desktop</span></a>';
      document.body.appendChild(dock);

      const quickLinks=[...dock.querySelectorAll('[data-mobile-target]')];
      const sectionIds=['home','services','contact'];
      const setActive=()=>{
        const y=window.scrollY+window.innerHeight*.34;
        let best='home';
        sectionIds.forEach(id=>{
          const el=document.getElementById(id);
          if(el&&el.offsetTop<=y)best=id;
        });
        quickLinks.forEach(a=>a.classList.toggle('active',a.dataset.mobileTarget===best));
      };
      addEventListener('scroll',setActive,{passive:true});
      setActive();
    }

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