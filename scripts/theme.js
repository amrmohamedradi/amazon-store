const STORAGE_KEY = 'theme'; // 'dark' | 'light'

function isDarkPreferred() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'dark') return true;
  if (stored === 'light') return false;
  // default to system
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function applyTheme() {
  const dark = isDarkPreferred();
  const root = document.documentElement; // <html>
  if (dark) root.classList.add('theme-dark');
  else root.classList.remove('theme-dark');
  updateToggleIcon();
}

function updateToggleIcon() {
  const btn = document.querySelector('.js-theme-toggle');
  if (!btn) return;
  const dark = document.documentElement.classList.contains('theme-dark');
  btn.textContent = dark ? '☀️' : '🌙';
  btn.setAttribute('title', dark ? 'Switch to light mode' : 'Switch to dark mode');
  btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
}

function toggleTheme() {
  const dark = document.documentElement.classList.toggle('theme-dark');
  localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light');
  updateToggleIcon();
}

document.addEventListener('DOMContentLoaded', () => {
  applyTheme();
  const btn = document.querySelector('.js-theme-toggle');
  if (btn) btn.addEventListener('click', toggleTheme);
});

export {};
