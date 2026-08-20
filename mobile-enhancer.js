(()=>{
  document.documentElement.classList.add('ace-mobile');

  const init=()=>{
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