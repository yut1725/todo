export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  window.addEventListener('load', () => {
    // BASE_URL respects Vite's `base` config so this resolves correctly
    // both locally (/) and on GitHub Pages (/repo-name/).
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`)
      .catch((err) => console.error('Service worker registration failed:', err))
  })
}
