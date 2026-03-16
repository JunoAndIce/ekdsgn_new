import { useEffect } from 'react';

const createRowController = (row) => {
  const state = {
    isDown: false,
    didDrag: false,
    startX: 0,
    startScrollLeft: 0,
    lastX: 0,
    lastT: 0,
    velocity: 0,
    frameId: 0,
    suppressClickUntil: 0,
    activePointerId: null,
    dragThreshold: 6,
    clickSuppressMs: 220,
  };

  const markDragging = (dragging) => {
    row.classList.toggle('is-dragging', dragging);
    row.dataset.dragging = dragging ? 'true' : 'false';
  };

  const stopInertia = () => {
    if (state.frameId) {
      window.cancelAnimationFrame(state.frameId);
      state.frameId = 0;
    }
  };

  const startInertia = () => {
    stopInertia();

    let velocity = state.velocity;
    let lastFrame = performance.now();

    const tick = (now) => {
      const dt = Math.min(34, now - lastFrame);
      lastFrame = now;

      if (Math.abs(velocity) < 0.02) {
        stopInertia();
        return;
      }

      const maxScrollLeft = row.scrollWidth - row.clientWidth;
      row.scrollLeft += velocity * dt;

      if ((row.scrollLeft <= 0 && velocity < 0) || (row.scrollLeft >= maxScrollLeft && velocity > 0)) {
        stopInertia();
        return;
      }

      velocity *= 0.92;
      state.frameId = window.requestAnimationFrame(tick);
    };

    state.frameId = window.requestAnimationFrame(tick);
  };

  const startDrag = (clientX, pointerId = null) => {
    if (row.scrollWidth <= row.clientWidth) {
      return;
    }

    stopInertia();

    state.isDown = true;
    state.didDrag = false;
    state.startX = clientX;
    state.startScrollLeft = row.scrollLeft;
    state.lastX = clientX;
    state.lastT = performance.now();
    state.velocity = 0;
    state.activePointerId = pointerId;
    markDragging(false);
  };

  const moveDrag = (clientX) => {
    if (!state.isDown) {
      return false;
    }

    const deltaX = clientX - state.startX;
    const now = performance.now();
    const dt = Math.max(1, now - state.lastT);
    const dx = clientX - state.lastX;

    if (Math.abs(deltaX) > state.dragThreshold) {
      state.didDrag = true;
      markDragging(true);
    }

    if (state.didDrag) {
      row.scrollLeft = state.startScrollLeft - deltaX;
      const pointerVelocity = dx / dt;
      state.velocity = (state.velocity * 0.8) + (-pointerVelocity * 0.2);
    }

    state.lastX = clientX;
    state.lastT = now;

    return state.didDrag;
  };

  const endDrag = () => {
    if (!state.isDown) {
      return;
    }

    state.isDown = false;

    if (state.didDrag) {
      state.suppressClickUntil = performance.now() + state.clickSuppressMs;
      markDragging(false);
      startInertia();
    } else {
      markDragging(false);
    }

    state.activePointerId = null;
  };

  const onWheel = (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    row.scrollLeft += event.deltaY;
    event.preventDefault();
  };

  const onClickCapture = (event) => {
    if (performance.now() < state.suppressClickUntil || row.dataset.dragging === 'true') {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  const onDragStart = (event) => {
    event.preventDefault();
  };

  const removeListeners = [];
  const add = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    removeListeners.push(() => target.removeEventListener(type, handler, options));
  };

  const hasPointer = typeof window !== 'undefined' && 'PointerEvent' in window;

  if (hasPointer) {
    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && event.button !== 0) {
        return;
      }

      startDrag(event.clientX, event.pointerId);

      if (state.isDown && typeof row.setPointerCapture === 'function') {
        row.setPointerCapture(event.pointerId);
      }

      event.preventDefault();
    };

    const onPointerMove = (event) => {
      if (!state.isDown) {
        return;
      }

      if (state.activePointerId !== null && event.pointerId !== state.activePointerId) {
        return;
      }

      const didDrag = moveDrag(event.clientX);
      if (didDrag) {
        event.preventDefault();
      }
    };

    const onPointerEnd = (event) => {
      if (state.activePointerId !== null && event.pointerId !== state.activePointerId) {
        return;
      }

      if (typeof row.releasePointerCapture === 'function') {
        try {
          row.releasePointerCapture(event.pointerId);
        } catch (_error) {
          // no-op
        }
      }

      endDrag();
    };

    add(row, 'pointerdown', onPointerDown);
    add(row, 'pointermove', onPointerMove);
    add(row, 'pointerup', onPointerEnd);
    add(row, 'pointercancel', onPointerEnd);
    add(row, 'pointerleave', onPointerEnd);
  } else {
    const onMouseDown = (event) => {
      if (event.button !== 0) {
        return;
      }
      startDrag(event.clientX);
      event.preventDefault();
    };

    const onMouseMove = (event) => {
      const didDrag = moveDrag(event.clientX);
      if (didDrag) {
        event.preventDefault();
      }
    };

    const onMouseUp = () => {
      endDrag();
    };

    const onTouchStart = (event) => {
      const touch = event.touches && event.touches[0];
      if (!touch) {
        return;
      }
      startDrag(touch.clientX);
    };

    const onTouchMove = (event) => {
      const touch = event.touches && event.touches[0];
      if (!touch) {
        return;
      }

      const didDrag = moveDrag(touch.clientX);
      if (didDrag) {
        event.preventDefault();
      }
    };

    const onTouchEnd = () => {
      endDrag();
    };

    add(row, 'mousedown', onMouseDown);
    add(window, 'mousemove', onMouseMove);
    add(window, 'mouseup', onMouseUp);
    add(row, 'touchstart', onTouchStart, { passive: true });
    add(row, 'touchmove', onTouchMove, { passive: false });
    add(row, 'touchend', onTouchEnd);
    add(row, 'touchcancel', onTouchEnd);
  }

  add(row, 'wheel', onWheel, { passive: false });
  add(row, 'click', onClickCapture, true);
  add(row, 'dragstart', onDragStart);

  return () => {
    stopInertia();
    removeListeners.forEach((remove) => remove());
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
