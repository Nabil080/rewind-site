const html = document.documentElement;

// Theme
const themeColor = { light: '#ecedef', dark: '#121212' };
function isDark() {
  const t = html.dataset.theme;
  return t ? t === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
}
function showTheme() {
  for (const m of document.querySelectorAll('meta[name="theme-color"]')) m.content = themeColor[isDark() ? 'dark' : 'light'];
}
document.querySelector('.theme').addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  html.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch {}
  showTheme();
});
if (html.dataset.theme) showTheme();

// Language. A link to one language's section (#fr, #waitlist...) opens that language.
function setLang(lang) {
  html.lang = lang;
  document.title = lang === 'fr' ? 'Rewind : politique de confidentialité' : 'Rewind privacy policy';
  for (const b of document.querySelectorAll('.switch button')) b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
}
const fromLink = { '#fr': 'fr', '#liste-attente': 'fr', '#en': 'en', '#waitlist': 'en' }[location.hash];
setLang(fromLink || html.lang);
for (const b of document.querySelectorAll('.switch button')) {
  b.addEventListener('click', () => {
    setLang(b.dataset.lang);
    try { localStorage.setItem('lang', b.dataset.lang); } catch {}
    if (location.hash) history.replaceState(null, '', location.pathname);
  });
}
