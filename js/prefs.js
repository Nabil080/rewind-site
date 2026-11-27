// Runs in <head> so the saved theme and language apply before the page shows.
{
  const html = document.documentElement;
  let saved = {};
  try { saved = { theme: localStorage.getItem('theme'), lang: localStorage.getItem('lang') }; } catch {}
  if (saved.theme === 'light' || saved.theme === 'dark') html.dataset.theme = saved.theme;
  const browserLang = (navigator.language || '').toLowerCase().startsWith('fr') ? 'fr' : 'en';
  html.lang = saved.lang === 'fr' || saved.lang === 'en' ? saved.lang : browserLang;
}
