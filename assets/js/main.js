
(function(){
  const nav = document.querySelector('.nav');

  // shrink header on scroll
  const onScroll = ()=>{
    if(window.scrollY > 16) nav.classList.add('shrink');
    else nav.classList.remove('shrink');
  };
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  // reveal with stagger
  const els = Array.from(document.querySelectorAll('.reveal'));
  els.forEach((el, i)=>{
    if(el.classList.contains('stagger')) el.style.setProperty('--d', (i%10)*60 + 'ms');
  });
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('on');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  els.forEach(el=>io.observe(el));

  // mobile menu
  const btn = document.querySelector('[data-hamburger]');
  const panel = document.querySelector('[data-mobile-panel]');
  if(btn && panel){
    btn.addEventListener('click', ()=>{
      const open = panel.classList.toggle('open');
      panel.style.display = open ? 'block' : 'none';
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // faq
  document.querySelectorAll('[data-faq]').forEach(item=>{
    const q = item.querySelector('button');
    q.addEventListener('click', ()=>{
      const open = item.classList.toggle('open');
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
      const pm = q.querySelector('.pm');
      if(pm) pm.textContent = open ? '–' : '+';
    });
  });
})();


// V4.2 seamless iframe tabs + skeleton
(function(){
  const shell = document.querySelector('[data-embed-shell]');
  if(!shell) return;

  const tabs = shell.querySelectorAll('[data-tab]');
  const frames = shell.querySelectorAll('[data-frame]');
  const skel = shell.querySelector('[data-skeleton]');

  function setActive(name){
    tabs.forEach(t=>t.classList.toggle('active', t.getAttribute('data-tab')===name));
    frames.forEach(fr=>fr.classList.toggle('active', fr.getAttribute('data-frame')===name));
    if(skel) skel.classList.remove('off'); // show skeleton while switching
  }

  tabs.forEach(t=>{
    t.addEventListener('click', ()=> setActive(t.getAttribute('data-tab')));
  });

  frames.forEach(fr=>{
    fr.addEventListener('load', ()=>{
      if(skel) skel.classList.add('off');
    });
  });

  // default active
  const first = tabs[0]?.getAttribute('data-tab') || 'notice';
  setActive(first);
})();
