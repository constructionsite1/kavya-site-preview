// Shared motion for every page: driven entirely by data-* hooks in the markup,
// so a page only gets the effects whose hooks it contains.
(() => {
  const root = document.getElementById('top') || document.body;
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ease = 'cubic-bezier(.2,.8,.2,1)';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const $$ = (s, el = root) => [...el.querySelectorAll(s)];
  const EMAIL = 'contentkavyachawla@gmail.com';

  // ---- menu sheet -------------------------------------------------------
  const sheet = root.querySelector('[data-menu-sheet]');
  const overlay = root.querySelector('[data-menu-overlay]');
  const opener = root.querySelector('[data-action="open-menu"]');
  const setMenu = on => {
    if (!sheet) return;
    [sheet, overlay].forEach(el => { el.style.opacity = on ? 1 : 0; el.style.pointerEvents = on ? 'auto' : 'none'; });
    sheet.style.transform = on ? 'none' : 'translateY(-14px) scale(.94)';
    sheet.setAttribute('aria-hidden', on ? 'false' : 'true');
    sheet.inert = !on;
    if (opener) opener.setAttribute('aria-expanded', on ? 'true' : 'false');
    if (on) setTimeout(() => { const f = sheet.querySelector('a,button'); f && f.focus(); }, 60);
    else if (sheet.contains(document.activeElement) && opener) opener.focus();
  };
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  // ---- copy email -------------------------------------------------------
  const copyEmail = btn => {
    const label = btn.querySelector('[data-copy-label]') || btn;
    const was = label.dataset.was || (label.dataset.was = label.textContent);
    const done = ok => {
      label.textContent = ok ? 'Copied! Talk soon.' : EMAIL;
      clearTimeout(btn._ct); btn._ct = setTimeout(() => { label.textContent = was; }, 2200);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(EMAIL).then(() => done(true), () => done(false));
    else done(false);
  };

  // ---- hero entrance + scroll reveals -----------------------------------
  if (!calm) $$('[data-hero]').forEach((el, i) => el.animate(
    [{ opacity: 0, transform: 'translateY(26px)' }, { opacity: 1, transform: 'none' }],
    { duration: 950, delay: 120 + i * 110, easing: ease, fill: 'backwards' }));

  if (!calm && 'IntersectionObserver' in window) {
    const reveals = $$('[data-reveal]');
    reveals.forEach(el => { el.style.opacity = '0'; });
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; io.unobserve(el); el.style.opacity = '';
      const from = el.dataset.reveal === 'rise' ? 'translateY(70px) scale(.94)' : 'translateY(30px)';
      el.animate([{ opacity: 0, transform: from }, { opacity: 1, transform: 'none' }],
        { duration: 1000, delay: +(el.dataset.delay || 0), easing: 'cubic-bezier(.2,.9,.3,1.1)', fill: 'backwards' });
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(el => io.observe(el));
  }

  // ---- rotating headline words (one rotation per group of siblings) ------
  const groups = new Map();
  $$('[data-rot]').forEach(el => { const g = groups.get(el.parentElement) || []; g.push(el); groups.set(el.parentElement, g); });
  groups.forEach(rot => {
    if (rot.length < 2) return;
    let ri = 0;
    setInterval(() => {
      if (document.hidden) return;
      const a = rot[ri], b = rot[(ri + 1) % rot.length]; ri = (ri + 1) % rot.length;
      a.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: calm ? 'none' : 'translateY(-40%) rotate(-3deg)' }], { duration: 500, easing: ease });
      a.style.opacity = '0';
      b.animate([{ opacity: 0, transform: calm ? 'none' : 'translateY(40%) rotate(3deg)' }, { opacity: 1, transform: 'none' }],
        { duration: 700, delay: 120, easing: 'cubic-bezier(.2,.9,.3,1.3)', fill: 'backwards' });
      b.style.opacity = '1';
    }, 2800);
  });

  // ---- spinning stickers + marquees -------------------------------------
  if (!calm) $$('[data-spin]').forEach(el => el.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(360deg)' }], { duration: 26000, iterations: Infinity }));
  $$('[data-track]').forEach(track => {
    const mq = track.closest('[data-marquee]') || track;
    const base = +(track.dataset.speed || 110000);
    const m = track.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-50%)' }], { duration: calm ? base * 2 : base, iterations: Infinity });
    mq.addEventListener('pointerenter', () => m.updatePlaybackRate(0.15));
    mq.addEventListener('pointerleave', () => m.updatePlaybackRate(1));
  });

  // ---- pockets: the paper pops up on hover, or with scroll on touch ------
  const touch = matchMedia('(hover: none)').matches;
  const papers = $$('[data-pocket]').filter(p => touch || p.dataset.pocket === 'hero').map(p => {
    const pp = p.querySelector('[data-paper]'); pp.style.transition = 'none'; return [p, pp, p.dataset.pocket === 'hero'];
  });
  if (!touch) $$('[data-pocket]:not([data-pocket="hero"])').forEach(p => {
    const paper = p.querySelector('[data-paper]');
    const up = () => { paper.style.transform = 'translateY(-30px) rotate(-3deg)'; };
    const dn = () => { paper.style.transform = ''; };
    p.addEventListener('pointerenter', up); p.addEventListener('pointerleave', dn);
    p.addEventListener('focus', up); p.addEventListener('blur', dn);
  });

  // ---- critters that peek out with a speech bubble ------------------------
  const peeks = $$('[data-peek]');
  const bubble = p => {
    const b = p.querySelector('[data-bubble]'); if (!b) return;
    b.animate([{ opacity: 0, transform: 'scale(.5)' }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.2,.9,.3,1.5)', fill: 'forwards' });
    clearTimeout(p._bt); p._bt = setTimeout(() => b.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'forwards' }), 2600);
  };
  const move = (p, from, to, opt) => {
    const c = p.querySelector('[data-critter]'); p._a && p._a.cancel();
    p._a = c.animate([{ transform: from }, { transform: to }], Object.assign({ fill: 'forwards' }, opt));
  };
  const popUp = (p, dur) => { p._in = true; move(p, 'translateY(105%)', 'translateY(12%)', { duration: calm ? 1 : dur, easing: 'cubic-bezier(.3,1.6,.5,1)' }); };
  const hop = p => {
    if (!p._in) popUp(p, 600);
    if (!calm) p.querySelector('[data-critter]').animate([{ transform: 'translateY(12%)' }, { transform: 'translateY(0%) rotate(-6deg)' }, { transform: 'translateY(8%) rotate(5deg)' }, { transform: 'translateY(12%)' }], { duration: 600, easing: 'ease-out' });
    bubble(p);
  };
  if ('IntersectionObserver' in window) {
    const pio = new IntersectionObserver(es => es.forEach(e => {
      const p = e.target;
      if (e.isIntersecting && !p._in) {
        p._in = true;
        move(p, 'translateY(105%)', 'translateY(12%)', { duration: calm ? 1 : 850, delay: calm ? 0 : 250, easing: 'cubic-bezier(.3,1.6,.5,1)' });
        setTimeout(() => p._in && bubble(p), calm ? 300 : 1100);
      } else if (!e.isIntersecting && p._in) {
        p._in = false; move(p, 'translateY(12%)', 'translateY(105%)', { duration: calm ? 1 : 420, easing: 'ease-in' });
      }
    }), { threshold: 0.5, rootMargin: '0px 0px -8% 0px' });
    peeks.forEach(p => pio.observe(p));
  }
  peeks.forEach(p => p.addEventListener('click', e => { if (p.tagName === 'BUTTON') e.preventDefault(); hop(p); }));
  setInterval(() => peeks.forEach(p => {
    if (p._in && Math.random() < 0.5) p.querySelectorAll('[data-eye]').forEach(g => g.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.1)' }, { transform: 'scaleY(1)' }], { duration: 220 }));
  }), 2600);

  // ---- the lamp: pull the string for a tiny note --------------------------
  const lamp = root.querySelector('[data-lamp]');
  const noteBox = root.querySelector('[data-note]');
  const notes = noteBox && noteBox.dataset.notes ? JSON.parse(noteBox.dataset.notes) : [
    'reminder: make yourself a cup of chai in your favourite mug.', 'unclench your jaw, drop your shoulders. okay, carry on.',
    'drink some water, bestie.', 'your brand doesn’t need to go viral to be loved.', 'take the long way home today.',
    'good content starts with a good day. have one.'];
  let lampOn = false, pulled = false, noteIdx = 0, skipClick = 0;
  const toggleLamp = () => {
    lampOn = !lampOn;
    if (lampOn && pulled) noteIdx = (noteIdx + 1) % notes.length;
    pulled = true;
    const show = (sel, on) => { const el = root.querySelector(sel); if (el) el.style.opacity = on ? 1 : 0; };
    show('[data-glow]', lampOn); show('[data-bulb]', lampOn); show('[data-hint]', false);
    if (noteBox) {
      noteBox.style.opacity = lampOn ? 1 : 0;
      noteBox.style.transform = lampOn ? 'translate(-50%, 0)' : 'translate(-50%, 18px)';
      const t = noteBox.querySelector('[data-note-text]'); if (t) t.textContent = notes[noteIdx];
    }
    if (lamp && !calm) lamp.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(3deg)' }, { transform: 'rotate(-2deg)' }, { transform: 'rotate(1deg)' }, { transform: 'rotate(0)' }], { duration: 900, easing: 'ease-out' });
  };
  const pull = root.querySelector('[data-pull]'), str = root.querySelector('[data-string]');
  if (pull && str) {
    let sy = null, pd = 0;
    pull.addEventListener('pointerdown', e => { sy = e.clientY; pd = 0; try { pull.setPointerCapture(e.pointerId); } catch (_) {} });
    pull.addEventListener('pointermove', e => { if (sy === null) return; pd = clamp(e.clientY - sy, 0, 70); str.style.height = (90 + pd) + 'px'; });
    const rel = () => {
      if (sy === null) return; sy = null;
      if (pd > 10) { skipClick = Date.now(); toggleLamp(); }
      pd = 0; const from = str.style.height || '90px'; str.style.height = '90px';
      str.animate([{ height: from }, { height: '76px' }, { height: '97px' }, { height: '90px' }], { duration: 550, easing: 'ease-out' });
    };
    pull.addEventListener('pointerup', rel); pull.addEventListener('pointercancel', rel);
  }

  // ---- one click handler for every data-action ----------------------------
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-action]'); if (!a) return;
    const act = a.dataset.action;
    if (act === 'open-menu') setMenu(true);
    else if (act === 'close-menu') setMenu(false);
    else if (act === 'copy-email') copyEmail(a);
    else if (act === 'toggle-lamp') { if (Date.now() - skipClick > 700) toggleLamp(); }
  });

  // ---- filter chips (work page) -----------------------------------------
  $$('[data-filters]').forEach(group => {
    const items = $$(group.dataset.filters + ' [data-kinds]', document);
    const count = document.querySelector('[data-filter-count]');
    group.addEventListener('click', e => {
      const b = e.target.closest('[data-filter]'); if (!b) return;
      const f = b.dataset.filter; let n = 0;
      group.querySelectorAll('[data-filter]').forEach(x => x.setAttribute('aria-pressed', x === b ? 'true' : 'false'));
      items.forEach(it => {
        const show = f === 'all' || it.dataset.kinds.split(' ').includes(f);
        it._want = show; if (show) n++;
        if (show && it.hidden) {
          it.hidden = false;
          if (!calm && it.style.opacity !== '0') it.animate([{ opacity: 0, transform: 'translateY(40px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.2,.9,.3,1.1)' });
        } else if (!show && !it.hidden) {
          if (calm) it.hidden = true;
          else it.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96)' }], { duration: 260, easing: 'ease-in' }).onfinish = () => { if (!it._want) it.hidden = true; };
        }
      });
      if (count) count.textContent = n === 1 ? 'Showing 1 story' : `Showing ${n} stories`;
    });
  });

  // ---- per-frame scroll effects: tea words, papers, parallax, swing, dock --
  const teas = $$('[data-tea]').map(t => [t, $$('[data-w]', t), -1]);
  const par = $$('[data-par]'), swings = $$('[data-swing]');
  const dock = root.querySelector('[data-dock]'), dockStop = root.querySelector('[data-dock-stop]');
  let lastY = null, ang = 0, vel = 0, dockOn = false;
  const tick = () => {
    const vh = innerHeight, y = scrollY;
    const dy = lastY === null ? 0 : y - lastY; lastY = y;
    if (swings.length && !calm) {
      vel += clamp(dy, -60, 60) * 0.035; vel = (vel - ang * 0.025) * 0.94; ang = clamp(ang + vel, -28, 28);
      swings.forEach(s => { s.style.transform = `rotate(${ang.toFixed(2)}deg)`; });
    }
    teas.forEach(t => {
      const r = t[0].getBoundingClientRect(), p = clamp((vh * 0.9 - r.top) / (r.height + vh * 0.25), 0, 1);
      if (Math.abs(p - t[2]) <= 0.002) return;
      t[2] = p; const n = t[1].length;
      t[1].forEach((w, i) => { const k = calm ? 1 : clamp(p * n * 1.25 - i, 0, 1); w.style.opacity = (0.16 + 0.84 * k).toFixed(3); });
    });
    papers.forEach(([p, pp, hero]) => {
      const r = p.getBoundingClientRect(); let t;
      if (hero) t = Math.min(clamp(y / 200, 0, 1), clamp((r.bottom - vh * 0.08) / (vh * 0.3), 0, 1));
      else { const d = Math.abs((r.top + r.height / 2) / vh - 0.5); t = clamp((0.45 - d) / 0.25, 0, 1); }
      t = t * t * (3 - 2 * t);
      pp.style.transform = t > 0.001 ? `translateY(${(-30 * t).toFixed(1)}px) rotate(${(-3 * t).toFixed(2)}deg)` : '';
    });
    if (!calm) par.forEach(el => { const r = el.parentElement.getBoundingClientRect(); el.style.transform = `translateY(${((r.top + r.height / 2 - vh / 2) * -(+el.dataset.par)).toFixed(1)}px)`; });
    if (dock) {
      const stopTop = dockStop ? dockStop.getBoundingClientRect().top : 1e9;
      const on = y > vh * 0.7 && stopTop > vh * 0.85;
      if (on !== dockOn) {
        dockOn = on;
        dock.style.transform = on ? 'translateX(-50%)' : 'translate(-50%, 140%)';
        dock.style.opacity = on ? 1 : 0; dock.style.pointerEvents = on ? 'auto' : 'none';
      }
    }
    requestAnimationFrame(tick);
  };
  tick();

  window.kavya = { calm, hop };
})();
