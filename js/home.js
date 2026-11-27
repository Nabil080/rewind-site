const html = document.documentElement;
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Waitlist, sent through FormSubmit
const waitlist = document.getElementById('waitlist');
const TEXT = {
  en: { placeholder: 'you@example.com', ok: "You're on the list. One email when it's out, that's it.", err: "That didn't go through. Try again, or write to contact@kozuma.studio." },
  fr: { placeholder: 'toi@exemple.com', ok: "C'est noté. Un seul e-mail à la sortie, promis.", err: "Ça n'a pas marché. Réessaie, ou écris à contact@kozuma.studio." },
};
function status(kind) {
  const s = waitlist.querySelector('.wl-status');
  s.className = `wl-status ${kind}`;
  s.textContent = TEXT[html.lang][kind];
}
if (waitlist) {
  if (new URLSearchParams(location.search).has('joined')) addEventListener('DOMContentLoaded', () => status('ok'));
  waitlist.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = waitlist.querySelector('button[type="submit"]');
    button.disabled = true;
    try {
      const res = await fetch(waitlist.action.replace('formsubmit.co/', 'formsubmit.co/ajax/'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(waitlist))),
      });
      const data = await res.json();
      if (!res.ok || String(data.success) !== 'true') throw new Error(data.message);
      for (const el of waitlist.querySelectorAll('.wl-row, .wl-consent')) el.hidden = true;
      status('ok');
    } catch {
      status('err');
      button.disabled = false;
    }
  });
}

// Theme
const isDark = () => (html.dataset.theme ? html.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches);
const syncThemeColor = () => {
  const c = getComputedStyle(html).getPropertyValue('--bg').trim();
  for (const m of document.querySelectorAll('meta[name="theme-color"]')) m.content = c;
};
document.querySelector('.theme')?.addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  html.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
  syncThemeColor();
});
if (html.dataset.theme) syncThemeColor();

// Language
function setLang(lang) {
  html.lang = lang;
  if (waitlist) {
    waitlist.querySelector('input[name="email"]').placeholder = TEXT[lang].placeholder;
    waitlist.querySelector('input[name="language"]').value = lang;
  }
  for (const b of document.querySelectorAll('.switch button')) b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  for (const img of document.querySelectorAll('img[data-card]')) img.src = `img/${lang === 'fr' ? 'fr/' : ''}${img.dataset.card}.webp`;
  document.dispatchEvent(new CustomEvent('langchange'));
}
setLang(html.lang);
for (const b of document.querySelectorAll('.switch button')) {
  b.addEventListener('click', () => {
    setLang(b.dataset.lang);
    try { localStorage.setItem('lang', b.dataset.lang); } catch {}
  });
}

// Entrances
if (!still && 'IntersectionObserver' in window) {
  const items = document.querySelectorAll('[data-rise]');
  html.classList.add('rise-ready');
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('risen');
      io.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach((el) => io.observe(el));
}

// The ring turns backwards on scroll
const ring = document.querySelector('.ring');
if (!still) {
  let queued = false;
  const turn = () => { ring.style.setProperty('--turn', (scrollY * 0.12).toFixed(2)); queued = false; };
  addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(turn); } }, { passive: true });
  turn();
}

// Story player
const player = document.getElementById('player');
const imgs = [...player.querySelectorAll('.story img')];
const bars = [...player.querySelectorAll('.bars i')];
let i = 0;
function show(n) {
  i = (n + imgs.length) % imgs.length;
  imgs.forEach((img, k) => img.classList.toggle('on', k === i));
  bars.forEach((b, k) => { b.className = k < i ? 'done' : ''; if (k === i) { void b.offsetWidth; b.className = still ? 'done' : 'now'; } });
}
player.querySelector('.prev').addEventListener('click', () => show(i - 1));
player.querySelector('.next').addEventListener('click', () => show(i + 1));
for (const b of bars) b.addEventListener('animationend', () => show(i + 1));
const pause = (on) => player.classList.toggle('paused', on);
player.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') pause(true); });
player.addEventListener('pointerleave', () => pause(false));
player.addEventListener('focusin', () => pause(true));
player.addEventListener('focusout', () => pause(false));
document.addEventListener('visibilitychange', () => pause(document.hidden));
show(0);

// Card rail arrows
const rail = document.getElementById('rail');
for (const b of document.querySelectorAll('.rail-nav button')) {
  b.addEventListener('click', () => {
    const step = rail.querySelector('figure').getBoundingClientRect().width + 20;
    rail.scrollBy({ left: step * Number(b.dataset.dir), behavior: still ? 'auto' : 'smooth' });
  });
}
