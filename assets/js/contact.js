// Contact form: "I'll write it" field, sending to /api/contact, and a small celebration.
(() => {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;
  const card = document.querySelector('[data-form-card]');
  const success = document.querySelector('[data-form-success]');
  const error = form.querySelector('[data-form-error]');
  const otherWrap = form.querySelector('[data-other]');
  const need = form.elements.need, other = form.elements.need_other;
  const sendBtn = form.querySelector('[type="submit"]'), sendLabel = form.querySelector('[data-send-label]');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const syncOther = () => {
    const on = need.value === 'other';
    if (on === !otherWrap.hidden) return;
    otherWrap.hidden = !on; other.disabled = !on; other.required = on;
    if (on) {
      if (!calm) otherWrap.animate([{ opacity: 0, transform: 'translateY(-10px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: 'cubic-bezier(.2,.9,.3,1.3)' });
      other.focus();
    }
  };
  need.addEventListener('change', syncOther);

  const confetti = () => {
    if (calm) return;
    const colors = ['var(--color-accent)', 'var(--color-accent-2-600)', 'var(--color-accent-300)', 'var(--color-accent-2-300)', 'var(--color-accent-600)'];
    const box = card.getBoundingClientRect(), check = success.querySelector('[data-check]').getBoundingClientRect();
    const x0 = check.left - box.left + check.width / 2, y0 = check.top - box.top + check.height / 2;
    for (let i = 0; i < 22; i++) {
      const s = document.createElement('span');
      s.className = 'confetti';
      s.style.left = x0 + 'px'; s.style.top = y0 + 'px'; s.style.background = colors[i % colors.length];
      if (i % 3 === 0) s.style.borderRadius = '999px';
      card.appendChild(s);
      const a = Math.random() * Math.PI * 2, d = 90 + Math.random() * 150;
      s.animate([
        { transform: 'translate(-50%,-50%) rotate(0) scale(.4)', opacity: 1 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d - 40}px)) rotate(${Math.random() * 540 - 270}deg) scale(1)`, opacity: 1, offset: 0.7 },
        { transform: `translate(calc(-50% + ${Math.cos(a) * d * 1.1}px), calc(-50% + ${Math.sin(a) * d + 60}px)) rotate(${Math.random() * 720 - 360}deg) scale(.8)`, opacity: 0 }
      ], { duration: 1300 + Math.random() * 500, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => s.remove();
    }
  };

  const showSuccess = () => {
    form.hidden = true; success.hidden = false; success.focus({ preventScroll: true });
    if (!calm) {
      success.animate([{ opacity: 0, transform: 'translateY(30px) scale(.96)' }, { opacity: 1, transform: 'none' }], { duration: 700, easing: 'cubic-bezier(.2,.9,.3,1.1)' });
      success.querySelector('[data-check]').animate([{ transform: 'scale(0) rotate(-30deg)' }, { transform: 'scale(1.15) rotate(6deg)', offset: 0.6 }, { transform: 'none' }], { duration: 700, delay: 150, easing: 'ease-out', fill: 'backwards' });
    }
    setTimeout(confetti, calm ? 0 : 250);
    const cat = document.querySelector('#form [data-peek]');
    if (cat && window.kavya) { cat.querySelector('[data-bubble]').textContent = 'yay! talk soon'; window.kavya.hop(cat); }
    card.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
  };

  const fail = msg => {
    error.textContent = msg; error.hidden = false;
    if (!calm) error.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(-3px)' }, { transform: 'none' }], { duration: 420 });
  };

  form.addEventListener('submit', async e => {
    e.preventDefault();
    error.hidden = true;
    if (!form.checkValidity()) {
      const bad = form.querySelector(':invalid');
      form.reportValidity();
      if (bad && !calm) bad.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(5px)' }, { transform: 'none' }], { duration: 360 });
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    sendBtn.disabled = true; sendLabel.textContent = 'Sending…';
    try {
      const r = await fetch(form.action, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.error || 'That didn’t send.');
      showSuccess();
    } catch (err) {
      fail(`${err.message} Please try again, or email contentkavyachawla@gmail.com directly.`);
      if (window.turnstile) window.turnstile.reset();
    } finally {
      sendBtn.disabled = false; sendLabel.textContent = 'Send to Kavya';
    }
  });

  document.querySelector('[data-form-reset]').addEventListener('click', () => {
    form.reset(); syncOther(); success.hidden = true; form.hidden = false;
    if (window.turnstile) window.turnstile.reset();
    form.elements.name.focus();
  });

  // Without JavaScript the form posts normally and the server sends people back here with ?sent=1
  if (new URLSearchParams(location.search).get('sent') === '1') showSuccess();
})();
