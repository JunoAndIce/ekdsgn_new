import { useEffect } from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const DRAG_THRESHOLD = 5;    // px of movement before locking into drag mode
const FRICTION       = 0.95; // velocity multiplier per RAF frame (~60fps)
const MIN_VEL        = 0.25; // px/frame below which inertia stops
const VEL_WINDOW_MS  = 100;  // sample window for release-velocity calculation

// ─── Per-row controller ───────────────────────────────────────────────────────
const createRowController = (row) => {
  // Shared inertia RAF state
  let rafId  = null;
  let velX   = 0;

  const cancelRaf = () => {
    if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
  };

  const startInertia = () => {
    cancelRaf();
    const tick = () => {
      if (Math.abs(velX) < MIN_VEL) {
        velX = 0;
        row.classList.remove('is-dragging');
        return;
      }
      row.scrollLeft += velX;
      velX *= FRICTION;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  };

  // Velocity sampler: keeps the last VEL_WINDOW_MS of (x, t) samples
  const samples = [];
  const recordSample = (x) => {
    const now = performance.now();
    samples.push({ x, t: now });
    while (samples.length > 1 && now - samples[0].t > VEL_WINDOW_MS) samples.shift();
  };
  const calcVelocity = () => {
    if (samples.length < 2) return 0;
    const first = samples[0], last = samples[samples.length - 1];
    const dt = last.t - first.t;
    return dt > 0 ? ((first.x - last.x) / dt) * 16 : 0; // px/frame @ 60fps
  };
  const clearSamples = () => { samples.length = 0; };

  // One-shot click blocker attached after a confirmed drag ends.
  // Fires before any children's onClick, removes itself immediately.
  const stopOneClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };
  const blockNextClick = () => {
    row.addEventListener('click', stopOneClick, { capture: true, once: true });
  };

  // ── Mouse handlers (desktop) ───────────────────────────────────────────────
  let mouseDown    = false;
  let mouseStartX  = 0;
  let mouseScrollL = 0;
  let mouseDragged = false;

  const onMouseDown = (e) => {
    if (e.button !== 0) return;
    cancelRaf();
    row.classList.remove('is-dragging');
    mouseDown    = true;
    mouseDragged = false;
    mouseStartX  = e.clientX;
    mouseScrollL = row.scrollLeft;
    velX = 0;
    clearSamples();
    recordSample(e.clientX);
  };

  const onMouseMove = (e) => {
    if (!mouseDown) return;
    recordSample(e.clientX);
    const dx = e.clientX - mouseStartX;
    if (!mouseDragged && Math.abs(dx) > DRAG_THRESHOLD) {
      mouseDragged = true;
      row.classList.add('is-dragging');
    }
    if (mouseDragged) {
      row.scrollLeft = mouseScrollL - dx;
    }
  };

  const onMouseUp = () => {
    if (!mouseDown) return;
    mouseDown = false;
    if (mouseDragged) {
      velX = calcVelocity();
      blockNextClick();
      startInertia();
    }
    mouseDragged = false;
    clearSamples();
  };

  // ── Touch handlers (mobile / tablet) ──────────────────────────────────────
  let touchActive     = false;
  let touchId         = null;
  let touchStartX     = 0;
  let touchStartY     = 0;
  let touchScrollL    = 0;
  let touchIsH        = null; // null = undecided, true = horizontal, false = vertical

  const findTouch = (list) =>
    Array.from(list).find((t) => t.identifier === touchId) || null;

  const onTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    cancelRaf();
    row.classList.remove('is-dragging');
    const t     = e.touches[0];
    touchActive  = true;
    touchId      = t.identifier;
    touchStartX  = t.clientX;
    touchStartY  = t.clientY;
    touchScrollL = row.scrollLeft;
    touchIsH     = null;
    velX         = 0;
    clearSamples();
    recordSample(t.clientX);
  };

  const onTouchMove = (e) => {
    if (!touchActive) return;
    const t = findTouch(e.touches);
    if (!t) return;

    const dx = t.clientX - touchStartX;
    const dy = t.clientY - touchStartY;

    // Lock direction on first significant movement
    if (touchIsH === null && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
      touchIsH = Math.abs(dx) >= Math.abs(dy);
    }
    if (!touchIsH) return; // vertical – let browser handle page scroll

    e.preventDefault(); // take over horizontal scroll
    recordSample(t.clientX);
    row.scrollLeft = touchScrollL - dx;
    row.classList.add('is-dragging');
  };

  const onTouchEnd = (e) => {
    if (!touchActive) return;
    touchActive = false;
    if (touchIsH === true) {
      velX = calcVelocity();
      startInertia();
    } else {
      row.classList.remove('is-dragging');
    }
    touchId  = null;
    touchIsH = null;
    clearSamples();
  };

  // ── Wheel handler ──────────────────────────────────────────────────────────
  const onWheel = (e) => {
    // Trackpad / magic mouse sends deltaX – let CSS handle it naturally
    if (Math.abs(e.deltaX) > 0) return;
    // Vertical mouse wheel: redirect to horizontal scroll
    if (Math.abs(e.deltaY) > 0) {
      e.preventDefault();
      cancelRaf();
      row.scrollLeft += e.deltaY;
    }
  };

  const onDragStart = (e) => { e.preventDefault(); };

  // ── Attach listeners ──────────────────────────────────────────────────────
  const offs = [];
  const on = (el, type, fn, opts) => {
    el.addEventListener(type, fn, opts);
    offs.push(() => el.removeEventListener(type, fn, opts));
  };

  on(row,    'mousedown',  onMouseDown);
  on(window, 'mousemove',  onMouseMove);
  on(window, 'mouseup',    onMouseUp);
  on(row,    'touchstart', onTouchStart, { passive: true });
  on(row,    'touchmove',  onTouchMove,  { passive: false });
  on(row,    'touchend',   onTouchEnd);
  on(row,    'touchcancel',onTouchEnd);
  on(row,    'wheel',      onWheel,      { passive: false });
  on(row,    'dragstart',  onDragStart);

  return () => {
    cancelRaf();
    offs.forEach((fn) => fn());
  };
};

export const useMomentumDragScroll = (selector, dependencyToken) => {
  useEffect(() => {
    const rows = Array.from(document.querySelectorAll(selector));
    const cleanups = rows.map((row) => createRowController(row));

    return () => {
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [selector, dependencyToken]);
};

export default useMomentumDragScroll;
