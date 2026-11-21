(() => {
  const panel = document.querySelector('.collection-panel');
  const enabled = matchMedia('(min-width:801px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
  const layer = document.createElement('div');
  layer.className = 'collection-trail';
  layer.setAttribute('aria-hidden', 'true');
  const cells = new Map();
  const size = 16;
  let previous;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let reach, maxRadius, pullScale, smoothing, fadeTime, damping, frequency;
  function readSettings() {
    reach = Number(panel.dataset.radius ?? 169);
    maxRadius = Number(panel.dataset.diameter ?? 14.4) / 2;
    pullScale = Number(panel.dataset.pull ?? 80) / 100;
    smoothing = Number(panel.dataset.smoothing ?? 100);
    fadeTime = Number(panel.dataset.fade ?? 240);
    const bounce = Number(panel.dataset.bounce ?? 100) / 100;
    const natural = Math.hypot(12,24);
    damping = natural / (1 + (natural/12 - 1)*bounce);
    frequency = bounce ? Math.sqrt(natural**2 - damping**2) : 0;
    if (center) wake();
  }
  let center, target, frame = 0, lastTime;
  const dots = new Map();
  function sampleField() {
    const core = Math.max(size / 2, reach * .23);
    for (let y = Math.floor((center.y-reach)/size)*size+size/2; y < center.y+reach; y += size) {
      for (let x = Math.floor((center.x-reach)/size)*size+size/2; x < center.x+reach; x += size) {
        const dx = center.x-x, dy = center.y-y;
        const distance = Math.hypot(dx,dy);
        if (distance >= reach) continue;
        const t = Math.min(1,(reach-distance)/(reach-core));
        const profile = t*t*(3-2*t);
        const key = x + ',' + y;
        let dot = dots.get(key);
        if (!dot) {
          dot = {x,y,weight:0,ox:0,oy:0};
          dots.set(key,dot);
        }
        const room = size/2 - (1+(maxRadius-1)*profile);
        const attraction = 3.5*Math.sqrt(profile)*(1-profile)**2;
        const shift = distance ? Math.min(distance,room*Math.min(1,pullScale*attraction))/distance : 0;
        dot.goal = profile;
        dot.tx = dx*shift;
        dot.ty = dy*shift;
      }
    }
  }
  function paintDots(now, dt) {
    let moving = false;
    const ease = 1-Math.exp(-dt/smoothing);
    for (const [key,dot] of dots) {
      ctx.clearRect(dot.x-size/2,dot.y-size/2,size,size);
      if (dot.goal > 0) {
        dot.release = null;
        dot.weight += (dot.goal-dot.weight)*ease;
        dot.ox += (dot.tx-dot.ox)*ease;
        dot.oy += (dot.ty-dot.oy)*ease;
        moving ||= Math.abs(dot.goal-dot.weight)>.001 || Math.hypot(dot.tx-dot.ox,dot.ty-dot.oy)>.015;
        dot.goal = 0;
      } else {
        dot.release ??= {time:now,weight:dot.weight,ox:dot.ox,oy:dot.oy};
        const age = now-dot.release.time;
        if (age >= fadeTime) { dots.delete(key); continue; }
        // Radius settles monotonically; only the displacement overshoots.
        const time = age/1000 * 62/smoothing;
        const response = frequency
          ? Math.cos(frequency*time) + damping/frequency*Math.sin(frequency*time)
          : 1 + damping*time;
        const returnFactor = Math.exp(-damping*time)*response;
        dot.ox = dot.release.ox*returnFactor;
        dot.oy = dot.release.oy*returnFactor;
        dot.weight = dot.release.weight*(1-age/fadeTime)**2;
        moving = true;
      }
      const radius = 1+(maxRadius-1)*dot.weight;
      const displacement = Math.hypot(dot.ox,dot.oy);
      const limit = displacement ? Math.min(1,(size/2-radius)/displacement) : 1;
      ctx.fillStyle = 'rgba(181,202,190,' + .18*dot.weight + ')';
      ctx.beginPath();
      ctx.arc(dot.x+dot.ox*limit,dot.y+dot.oy*limit,radius,0,2*Math.PI);
      ctx.fill();
    }
    return moving;
  }
  function resizeGrid() {
    const width = layer.clientWidth, height = layer.clientHeight;
    if (!width || !height) return;
    const density = Math.min(2, devicePixelRatio);
    canvas.width = Math.round(width*density);
    canvas.height = Math.round(height*density);
    ctx.setTransform(canvas.width/width,0,0,canvas.height/height,0,0);
    if (center || dots.size) wake();
  }
  const observer = new ResizeObserver(resizeGrid);

  function wake() {
    if (!frame) {
      lastTime = performance.now();
      frame = requestAnimationFrame(draw);
    }
  }
  function draw(now) {
    frame = 0;
    const dt = Math.max(0, Math.min(64, now - lastTime));
    lastTime = now;
    if (target) {
      const follow = 1 - Math.exp(-dt / 42);
      center.x += (target.x - center.x) * follow;
      center.y += (target.y - center.y) * follow;
    }
    if (target) sampleField();
    const moving = paintDots(now,dt);
    if (moving || (target && Math.hypot(target.x-center.x,target.y-center.y)>.05)) frame = requestAnimationFrame(draw);
    else if (!target) center = null;
  }

  function lightCell(x, y) {
    const key = x + ',' + y;
    const existing = cells.get(key);
    const cell = existing?.effect.target || document.createElement('i');
    let opacity = 0, transform = 'scale(0.08)';
    if (existing) {
      const current = getComputedStyle(cell);
      opacity = Number(current.opacity);
      transform = current.transform;
      existing.cancel();
    } else {
      cell.style.left = x * size + 'px';
      cell.style.top = y * size + 'px';
      layer.append(cell);
    }
    const fade = cell.animate([
      {opacity, transform, easing:'cubic-bezier(.22,.68,.32,1)'},
      {opacity:0.15, transform:'scale(.84)', offset:.24, easing:'cubic-bezier(.38,0,.55,1)'},
      {opacity:0, transform:'scale(.08)'}
    ], {duration:260, fill:'forwards'});
    cells.set(key, fade);
    fade.onfinish = () => {
      if (cells.get(key) !== fade) return;
      cell.remove();
      cells.delete(key);
    };
  }

  function move(event) {
    if (event.pointerType === 'touch') return;
    const bounds = panel.getBoundingClientRect();
    const px = (event.clientX - bounds.left) * panel.offsetWidth / bounds.width;
    const py = (event.clientY - bounds.top) * panel.offsetHeight / bounds.height;
    if (layer.classList.contains('radial')) {
      target = {x:px,y:py};
      if (!center) center = {...target};
      wake();
      return;
    }
    const x = Math.floor(px / size);
    const y = Math.floor(py / size);
    const start = previous || {x, y};
    const steps = Math.max(Math.abs(x - start.x), Math.abs(y - start.y));
    if (!previous) lightCell(x, y);
    for (let i = Math.max(1, steps - 7); i <= steps; i++) {
      lightCell(Math.round(start.x + (x - start.x) * i / steps), Math.round(start.y + (y - start.y) * i / steps));
    }
    previous = {x, y};
    for (const animation of cells.values()) {
      const dot = animation.effect.target;
      if (Math.hypot(x - parseFloat(dot.style.left) / size, y - parseFloat(dot.style.top) / size) > 7 && animation.playbackRate === 1) animation.updatePlaybackRate(4);
    }
  }

  function resetPosition() {
    previous = undefined;
    target = null;
    if (center) wake();
  }
  function sync() {
    cancelAnimationFrame(frame);
    frame = 0;
    target = center = previous = null;
    dots.clear();
    for (const fade of cells.values()) fade.cancel();
    cells.clear();
    layer.replaceChildren();
    observer.disconnect();
    if (enabled.matches) {
      const radial = !!ctx && panel.dataset.cursorEffect !== 'trail';
      layer.classList.toggle('radial', radial);
      if (radial) {
        layer.append(canvas);
        observer.observe(layer);
      }
      panel.prepend(layer);
      panel.addEventListener('pointermove', move);
      panel.addEventListener('pointerleave', resetPosition);
      panel.addEventListener('pointercancel', resetPosition);
      window.addEventListener('blur', resetPosition);
    } else {
      panel.removeEventListener('pointermove', move);
      panel.removeEventListener('pointerleave', resetPosition);
      panel.removeEventListener('pointercancel', resetPosition);
      window.removeEventListener('blur', resetPosition);
      layer.remove();
    }
  }
  enabled.addEventListener('change', sync);
  panel.addEventListener('goblin-cursor-effect', sync);
  panel.addEventListener('goblin-radial-settings', readSettings);
  readSettings();
  sync();
})();
