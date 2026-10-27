// Decorative circles are a pure function of scroll position, not elapsed time.
(function () {
  'use strict';
  const canvas = document.getElementById('background-bubbles');
  const page = document.querySelector('.page');
  if (!canvas || !page) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = null, measureNeeded = true;
  let width = 0, height = 0, rails = [], enabled = false;
  const sizes = [0.75, 0.58, 1, 0.82, 0.68, 0.92];
  const initialX = [0.87, 0.20, 0.75, 0.10, 0.52, 0.91];
  const finalX = [0.20, 0.83, 0.53, 0.06, 0.92, 0.59];
  const colours = ['#8eaa98', '#a2b7a5', '#8eaa98', '#a2b7a5', '#8eaa98', '#96b09d'];
  function measure() {
    width = document.documentElement.clientWidth;
    height = window.innerHeight;
    const bounds = page.getBoundingClientRect();
    rails = [{x: 0, width: Math.max(0, bounds.left - 8)},
      {x: bounds.right + 8, width: Math.max(0, width - bounds.right - 8)}];
    enabled = width >= 760 && Math.min(rails[0].width, rails[1].width) >= 40;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.style.visibility = enabled ? 'visible' : 'hidden';
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    measureNeeded = false;
  }
  function draw() {
    frame = null;
    if (document.hidden) return;
    if (measureNeeded) measure();
    const range = Math.max(1, document.documentElement.scrollHeight - height);
    const scrollProgress = Math.max(0, Math.min(1, window.scrollY / range));
    // The reduced-motion composition stays fixed throughout scrolling.
    const p = motion.matches ? 0 : scrollProgress;
    ctx.clearRect(0, 0, width, height);
    let visible = 0;
    if (enabled) {
      ctx.save();
      ctx.beginPath();
      rails.forEach(rail => ctx.rect(rail.x, 0, rail.width, height));
      ctx.clip();
      rails.forEach((rail, side) => {
        const baseRadius = Math.min(150, rail.width * 0.55);
        for (let i = 5; i >= 0; i--) {
          const radius = baseRadius * sizes[i] * (0.9 + p * 0.1);
          const topY = [height * 0.18, height * 0.45,
            height + radius * 0.40, height + radius * 0.85,
            height + radius * 2, height + radius * 3][i];
          const bottomY = [height + radius * 0.50, height + radius * 0.45,
            height - radius * 0.45, height - radius * 0.55,
            height - radius * 1.55, height - radius * 1.85][i];
          const fraction = initialX[i] + (finalX[i] - initialX[i]) * p;
          const x = rail.x + rail.width * (side ? 1 - fraction : fraction);
          const y = topY + (bottomY - topY) * p;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = colours[i];
          ctx.fill();
          if (y - radius < height && y + radius > 0) visible++;
        }
      });
      ctx.restore();
    }
    canvas.dataset.settledCount = String(visible);
    canvas.dataset.floatingCount = '0';
    canvas.dataset.scrollProgress = scrollProgress.toFixed(3);
    canvas.dataset.motion = enabled ? (motion.matches ? 'reduced' : 'scroll-linked') : 'hidden';
    // No next frame: a stationary page always has stationary circles.
  }
  function schedule() {
    if (frame === null && !document.hidden) frame = requestAnimationFrame(draw);
  }
  function resize() { measureNeeded = true; schedule(); }
  window.addEventListener('scroll', function () {
    if (!motion.matches) schedule();
  }, {passive: true});
  window.addEventListener('resize', resize, {passive: true});
  motion.addEventListener('change', resize);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (frame !== null) cancelAnimationFrame(frame);
      frame = null;
    } else resize();
  });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(resize).observe(page);
  schedule();
})();
