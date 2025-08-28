/* theme.js
 * Tailwind CDN config + theme init + parallax (mousemove + scroll) with reduced-motion support
 */

/* -----------------------------
   Tailwind CDN config
   NOTE: This must execute BEFORE loading the Tailwind CDN script.
   If you're currently loading theme.js after Tailwind, either:
   1) move this file above the CDN <script>, or
   2) inline just this config block in a <script> before the CDN include.
-------------------------------- */
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'ui-sans-serif', 'system-ui'] },
      colors: {
        brand: {
          DEFAULT: '#ef1237',
          100: '#ffd6de',
          300: '#ff5775',
          500: '#ef1237',
          700: '#950a24'
        },
        basisbg: '#100f27'
      },
      boxShadow: {
        soft: '0 8px 30px rgba(0,0,0,0.08)'
      }
    }
  }
};

/* -----------------------------
   Theme: dark mode bootstrap
-------------------------------- */
(() => {
  try {
    const stored = localStorage.getItem('theme');
    const systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored || (systemDark ? 'dark' : 'light');
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch {
    // no-op if storage blocked
  }
})();

/* -----------------------------
   Reduced motion detection
-------------------------------- */
const prefersReducedMotion = window.matchMedia
  ? window.matchMedia('(prefers-reduced-motion: reduce)')
  : { matches: false, addEventListener: () => {} };

/* Utility to pause CSS gradient animations when reduced motion */
function updateAnimatedGradients() {
  const animated = document.querySelectorAll('.animated-gradient');
  animated.forEach(el => {
    el.style.animationPlayState = prefersReducedMotion.matches ? 'paused' : 'running';
  });
}
prefersReducedMotion.addEventListener?.('change', updateAnimatedGradients);
document.addEventListener('DOMContentLoaded', updateAnimatedGradients);

/* -----------------------------
   Parallax: mousemove (desktop)
   - Uses requestAnimationFrame to throttle
   - GPU-friendly translate3d
   - Controlled by [data-parallax] (number)
-------------------------------- */
(() => {
  if (prefersReducedMotion.matches) return;

  let rafId = null;
  let lastCx = 0, lastCy = 0;

  function onMouseMove(e) {
    const cx = e.clientX / window.innerWidth - 0.5;   // -0.5..0.5
    const cy = e.clientY / window.innerHeight - 0.5;  // -0.5..0.5
    lastCx = cx;
    lastCy = cy;
    if (rafId) return;
    rafId = requestAnimationFrame(applyMouseParallax);
  }

  function applyMouseParallax() {
    rafId = null;
    const layers = document.querySelectorAll('[data-parallax]');
    layers.forEach(layer => {
      const speed = parseFloat(layer.getAttribute('data-parallax')) || 1;
      // tune multiplier for subtle motion
      const tx = -lastCx * speed * 10;
      const ty = -lastCy * speed * 10;
      layer.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      layer.style.willChange = 'transform';
    });
  }

  // only add on devices that have a mouse/touchpad pointer
  const hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (hasFinePointer) {
    window.addEventListener('mousemove', onMouseMove, { passive: true });
  }
})();

/* -----------------------------
   Parallax: scroll (mobile/touch fallback)
   - Elements with [data-parallax-scroll]
   - speed attribute: number (e.g., 2, 4, 8)
   - Effect: translateY based on scroll position
-------------------------------- */
(() => {
  if (prefersReducedMotion.matches) return;

  const nodes = () => document.querySelectorAll('[data-parallax-scroll]');
  if (!nodes().length) return; // skip if not used

  let ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(applyScrollParallax);
  }

  function applyScrollParallax() {
    ticking = false;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    nodes().forEach(el => {
      const speed = parseFloat(el.getAttribute('data-parallax-scroll')) || 1;
      // smaller multiplier keeps it subtle; tweak to taste
      const ty = (scrollY * speed) * 0.05;
      el.style.transform = `translate3d(0, ${ty}px, 0)`;
      el.style.willChange = 'transform';
    });
  }

  // attach
  window.addEventListener('scroll', onScroll, { passive: true });
  // initial position
  applyScrollParallax();
})();
