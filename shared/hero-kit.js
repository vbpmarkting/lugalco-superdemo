// Utilidades comunes de los heroes 3D: renderer, tamaño, pausa fuera de pantalla y progreso de scroll.
import * as THREE from '../vendor/three/three.module.js';

export const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isMobile = () => innerWidth < 860;

export function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

export function createRenderer(canvas, { alpha = true } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile() ? 1.6 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  return renderer;
}

// Llama a onResize(w, h) con el tamaño CSS del lienzo
export function autoResize(renderer, camera, canvas, onResize) {
  const fit = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    if (camera.isPerspectiveCamera) { camera.aspect = w / h; camera.updateProjectionMatrix(); }
    onResize?.(w, h);
  };
  new ResizeObserver(fit).observe(canvas);
  fit();
}

// Progreso 0..1 de una sección alta con escenario fijado
export function scrollProgress(section) {
  const r = section.getBoundingClientRect();
  const span = r.height - innerHeight;
  return span <= 0 ? 0 : Math.min(1, Math.max(0, -r.top / span));
}

// Bucle que solo corre mientras el hero está en pantalla y la pestaña visible
export function loop(target, frame) {
  let visible = true, raf = 0, last = performance.now();
  const tick = now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; frame(dt, now / 1000); raf = requestAnimationFrame(tick); };
  const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(target);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  start();
}

// Puntero normalizado -1..1, suavizado
export function pointer() {
  const p = { x: 0, y: 0, tx: 0, ty: 0 };
  addEventListener('pointermove', e => { p.tx = (e.clientX / innerWidth) * 2 - 1; p.ty = (e.clientY / innerHeight) * 2 - 1; }, { passive: true });
  p.update = k => { p.x += (p.tx - p.x) * k; p.y += (p.ty - p.y) * k; };
  return p;
}

export function fail() { document.documentElement.classList.add('no-webgl'); }
export { THREE };
