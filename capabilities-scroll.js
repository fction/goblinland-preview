(() => {
  const section = document.querySelector('#capabilities');
  if (!section) return;
  const stage = section.querySelector('.cap-stage');
  const screens = [...section.querySelectorAll('.story-screen')];
  const groups = screens.map((_, i) => [...section.querySelectorAll('.cap-titles [data-step="' + i + '"]')]);
  const toggle = section.querySelector('.cap-switch');
  const motion = matchMedia('(prefers-reduced-motion:no-preference) and (min-height:650px)');
  // Each face carries its own bezel and status bar through the dissolve.
  const device = section.querySelector('.cap-device');
  const display = device.querySelector('.cap-screen');
  const status = display.querySelector('.cap-status');
  const homebar = display.querySelector('.cap-homebar');
  const faces = screens.map(screen => {
    const face = document.createElement('div');
    face.className = 'cap-face';
    const panel = display.cloneNode(false);
    panel.append(status.cloneNode(true), screen, homebar.cloneNode(true));
    face.append(panel);
    return face;
  });
  device.replaceChildren(...faces);
  device.classList.add('cap-device-animated');
  const digits = [...section.querySelectorAll('.auth-digits span')];
  const verify = section.querySelector('.auth-confirm');
  const dock = section.querySelector('.home-dock');
  let manual = 0;
  let queued = false;
  const clamp = n => Math.max(0, Math.min(1,n));
  const ease = n => { const t = clamp(n); return t*t*(3-2*t); };
  const names = ['Home screen','Sign in','Overview','Virtual card'];

  function render() {
    queued = false;
    section.toggleAttribute('data-pinned',motion.matches);
    toggle.hidden = motion.matches;
    const r = section.getBoundingClientRect();
    const position = motion.matches ? clamp(-r.top/Math.max(1,r.height-stage.clientHeight))*3.7-.35 : manual;
    const bounded = Math.max(0,Math.min(3,position));
    const from = Math.floor(bounded);
    // Keep Sign in fully visible while the code fills and Verify becomes available.
    const blend = from === 1 ? ease((bounded-1.71)/.27) : ease((bounded-from-.18)/.64);
    const current = Math.min(3, from + Number(blend >= .5));
    const phase = from + blend;
    const lowerControl = current === 1 ? verify.nextElementSibling : dock;
    const dockBounds = lowerControl.getBoundingClientRect();
    document.documentElement.toggleAttribute('data-home-dock-visible', current <= 1 && dockBounds.top < innerHeight && dockBounds.bottom > innerHeight * .9);
    groups.forEach((nodes,index) => {
      const visibility = clamp(1-2*Math.abs(phase-index));
      for (const node of nodes) {
        node.inert = index !== current;
        node.style.opacity = visibility;
        node.style.visibility = visibility > 0 ? 'visible' : 'hidden';
      }
    });
    // Pitch both faces together so their bezels align throughout the dissolve.
    const pitch = 24 * Math.sin(Math.PI * blend) ** 2;
    faces.forEach((face, index) => {
      const distance = phase - index;
      const alpha = 1 - ease((Math.abs(distance) - .22) / .56);
      face.hidden = alpha === 0;
      face.inert = index !== current;
      if (face.hidden) return;
      face.style.opacity = alpha;
      face.style.transform = blend > 0 && blend < 1
        ? 'perspective(1100px) rotateX(' + pitch + 'deg)' : 'none';
    });
    const auth = screens[1];
    section.toggleAttribute('data-signin',current === 1);
    const keypad = motion.matches ? ease((bounded-.79)/.11)*(1-ease((bounded-1.60)/.11)) : 1;
    auth.style.setProperty('--keypad',keypad);
    const entered = motion.matches ? Math.floor(clamp((bounded-.93)/.42)*digits.length) : digits.length;
    digits.forEach((digit,i) => {
      digit.toggleAttribute('data-filled',i < entered);
      digit.toggleAttribute('data-current',i === entered && bounded >= .89);
    });
    verify.toggleAttribute('data-ready',entered === digits.length);
    verify.toggleAttribute('data-pressed',motion.matches && bounded >= 1.56 && bounded < 1.65);
    toggle.textContent = names[(manual+1)%4]+' →';
  }
  function schedule() { if (!queued) { queued=true; requestAnimationFrame(render); } }
  toggle.addEventListener('click',()=>{manual=(manual+1)%4;render();});
  addEventListener('scroll',schedule,{passive:true});
  addEventListener('resize',schedule);
  motion.addEventListener('change',schedule);
  document.fonts.ready.then(schedule);
  render();
})();
