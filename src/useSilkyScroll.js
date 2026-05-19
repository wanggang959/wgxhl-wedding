import { useEffect } from 'react';

const wheelSkipSelector = '.wedding-map, .map-frame, input, textarea, select, [data-native-scroll]';
const scrollKeys = new Set(['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ']);

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3);
}

function getMaxScroll() {
  return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
}

function normalizeWheelDelta(event) {
  if (event.deltaMode === 1) {
    return event.deltaY * 18;
  }

  if (event.deltaMode === 2) {
    return event.deltaY * window.innerHeight;
  }

  return event.deltaY;
}

function shouldSkipWheel(event) {
  if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
    return true;
  }

  return event.target instanceof Element && Boolean(event.target.closest(wheelSkipSelector));
}

const defaultAutoScrollSpeed = __AUTO_SCROLL_SPEED__;

export function useSilkyScroll({ autoScroll = false, autoScrollSpeed = defaultAutoScrollSpeed } = {}) {
  useEffect(() => {
    const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduceMotionQuery.matches) return undefined;

    const root = document.documentElement;
    let wheelRaf = 0;
    let anchorRaf = 0;
    let autoRaf = 0;
    let autoLastTime = 0;
    let autoPauseUntil = autoScroll ? performance.now() + 900 : Infinity;
    let autoPosition = window.scrollY;
    let wheelTarget = window.scrollY;

    const cancelWheelAnimation = () => {
      if (wheelRaf) {
        cancelAnimationFrame(wheelRaf);
        wheelRaf = 0;
      }
    };

    const cancelAnchorAnimation = () => {
      if (anchorRaf) {
        cancelAnimationFrame(anchorRaf);
        anchorRaf = 0;
      }
    };

    const cancelAutoAnimation = () => {
      if (autoRaf) {
        cancelAnimationFrame(autoRaf);
        autoRaf = 0;
      }
    };

    const pauseAutoScroll = (duration = 4200) => {
      autoPauseUntil = performance.now() + duration;
      autoLastTime = 0;
      autoPosition = window.scrollY;
    };

    const autoScrollStep = (now) => {
      const maxScroll = getMaxScroll();

      if (!autoScroll || maxScroll <= 0 || window.scrollY >= maxScroll - 1) {
        autoRaf = 0;
        return;
      }

      if (document.hidden || wheelRaf || anchorRaf || now < autoPauseUntil) {
        autoLastTime = now;
        autoPosition = window.scrollY;
        autoRaf = requestAnimationFrame(autoScrollStep);
        return;
      }

      if (!autoLastTime) {
        autoLastTime = now;
      }

      const elapsedSeconds = Math.min((now - autoLastTime) / 1000, 0.04);
      autoLastTime = now;
      autoPosition = clamp(autoPosition + autoScrollSpeed * elapsedSeconds, 0, maxScroll);
      window.scrollTo(0, autoPosition);
      autoRaf = requestAnimationFrame(autoScrollStep);
    };

    const startAutoScroll = () => {
      if (!autoScroll || autoRaf) return;

      autoLastTime = 0;
      autoPosition = window.scrollY;
      autoRaf = requestAnimationFrame(autoScrollStep);
    };

    const smoothWheelStep = () => {
      const currentY = window.scrollY;
      const diff = wheelTarget - currentY;

      if (Math.abs(diff) < 0.5) {
        window.scrollTo(0, wheelTarget);
        wheelRaf = 0;
        return;
      }

      window.scrollTo(0, currentY + diff * 0.16);
      wheelRaf = requestAnimationFrame(smoothWheelStep);
    };

    const onWheel = (event) => {
      if (event.target instanceof Element && event.target.closest('.music-gate')) {
        event.preventDefault();
        return;
      }

      pauseAutoScroll();

      if (shouldSkipWheel(event)) return;

      const delta = normalizeWheelDelta(event);
      if (Math.abs(delta) < 0.5) return;

      event.preventDefault();
      cancelAnchorAnimation();

      wheelTarget = clamp((wheelRaf ? wheelTarget : window.scrollY) + delta, 0, getMaxScroll());

      if (!wheelRaf) {
        wheelRaf = requestAnimationFrame(smoothWheelStep);
      }
    };

    const animateAnchorScroll = (targetY) => {
      cancelWheelAnimation();
      pauseAutoScroll(5200);
      cancelAnchorAnimation();

      const startY = window.scrollY;
      const distance = targetY - startY;
      const duration = clamp(Math.abs(distance) * 0.48, 560, 980);
      const startedAt = performance.now();

      const step = (now) => {
        const progress = clamp((now - startedAt) / duration, 0, 1);
        window.scrollTo(0, startY + distance * easeOutCubic(progress));

        if (progress < 1) {
          anchorRaf = requestAnimationFrame(step);
          return;
        }

        anchorRaf = 0;
        wheelTarget = window.scrollY;
      };

      anchorRaf = requestAnimationFrame(step);
    };

    const onAnchorClick = (event) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      if (!link) return;

      const hash = link.getAttribute('href');
      if (!hash || hash === '#') return;

      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (!target) return;

      event.preventDefault();

      const targetY = clamp(target.getBoundingClientRect().top + window.scrollY, 0, getMaxScroll());
      animateAnchorScroll(targetY);
      window.history.pushState(null, '', hash);
    };

    const syncWheelTarget = () => {
      if (!wheelRaf && !anchorRaf) {
        wheelTarget = window.scrollY;
      }

      if (!autoRaf) {
        autoPosition = window.scrollY;
        if (autoScroll && window.scrollY < getMaxScroll() - 1) {
          startAutoScroll();
        }
      }
    };

    const onPointerDown = () => {
      pauseAutoScroll();
    };

    const onTouchStart = () => {
      pauseAutoScroll();
    };

    const onKeyDown = (event) => {
      if (scrollKeys.has(event.key)) {
        pauseAutoScroll();
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        pauseAutoScroll();
        return;
      }

      startAutoScroll();
    };

    root.classList.add('silky-scroll');
    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('scroll', syncWheelTarget, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('click', onAnchorClick);
    startAutoScroll();

    return () => {
      cancelWheelAnimation();
      cancelAnchorAnimation();
      cancelAutoAnimation();
      root.classList.remove('silky-scroll');
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', syncWheelTarget);
      window.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('click', onAnchorClick);
    };
  }, [autoScroll, autoScrollSpeed]);
}
