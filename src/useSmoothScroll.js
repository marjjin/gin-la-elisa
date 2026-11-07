import { useEffect } from "react";
import Lenis from "lenis";

const nativeScrollArea = "dialog, form, input, textarea, select, [contenteditable]";

export default function useSmoothScroll({ onNavigateStart, onNavigateEnd } = {}) {
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis = null;
    let navigation = null;
    const temporaryFocusTargets = new Map();

    function finishNavigation(journey = navigation) {
      // Completion of an older journey must not unlock a newer destination.
      if (!navigation || journey !== navigation) return;
      navigation = null;
      onNavigateEnd?.();
    }

    function stop() {
      lenis?.destroy(); // Also cancels Lenis's automatic RAF and event listeners.
      lenis = null;
      finishNavigation();
    }

    function sync() {
      if (motion.matches || document.querySelector("dialog[open]")) {
        stop();
      } else if (!lenis) {
        lenis = new Lenis({
          autoRaf: true,
          smoothWheel: true,
          syncTouch: false,
          lerp: 0.105,
          allowNestedScroll: true,
          // Leave controls and their scroll containers to the browser.
          prevent: (node) => node.matches(nativeScrollArea),
        });
      }
    }

    function cancelMomentum() {
      if (lenis && !lenis.isStopped) {
        // stop/start cancels even when the current position equals targetScroll.
        lenis.stop();
        lenis.start();
      }
      finishNavigation();
    }

    function onUserScroll() {
      if (navigation) cancelMomentum();
    }

    function onPointerDown(event) {
      // Another anchor click replaces the destination without an intermediate
      // scrollspy update between pointerdown and click.
      const link = event.target.closest?.('a[href^="#"]');
      const followsAnchor =
        link &&
        (event.type === "touchstart" || event.button === 0) &&
        !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey &&
        !link.classList.contains("skip-link") &&
        !link.hasAttribute("download") &&
        (!link.target || link.target === "_self") &&
        !link.closest(nativeScrollArea);
      if (!followsAnchor) onUserScroll();
    }

    function onKeyDown() {
      // Stop wheel inertia before native keyboard navigation takes over.
      cancelMomentum();
    }

    function focusTarget(target) {
      if (!target.hasAttribute("tabindex") && target.tabIndex < 0) {
        target.setAttribute("tabindex", "-1");
        const restore = () => {
          target.removeAttribute("tabindex");
          target.removeEventListener("blur", restore);
          temporaryFocusTargets.delete(target);
        };
        temporaryFocusTargets.set(target, restore);
        target.addEventListener("blur", restore, { once: true });
      }
      target.focus({ preventScroll: true });
    }

    function onAnchorClick(event) {
      if (
        !lenis ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.detail === 0 || // Keep keyboard activation and skip links native.
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) return;

      const link = event.target.closest?.('a[href^="#"]');
      if (
        !link ||
        link.classList.contains("skip-link") ||
        link.hasAttribute("download") ||
        (link.target && link.target !== "_self") ||
        link.closest(nativeScrollArea)
      ) return;

      let target;
      try {
        target = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      } catch {
        return; // Leave malformed or unknown fragments to native navigation.
      }
      if (!(target instanceof HTMLElement)) return;

      event.preventDefault();
      const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
      const destination = window.scrollY + target.getBoundingClientRect().top - padding - margin;
      if (window.location.hash !== link.hash) {
        window.history.pushState(window.history.state, "", link.hash);
      }
      focusTarget(target);
      lenis.resize();
      const journey = {};
      navigation = journey;
      onNavigateStart?.(target.id);
      // A numeric destination avoids applying CSS padding twice across versions.
      lenis.scrollTo(destination, {
        duration: 0.95,
        easing: (progress) => 1 - Math.pow(1 - progress, 4),
        onComplete: () => finishNavigation(journey),
      });
    }

    const dialogs = new MutationObserver(sync);
    dialogs.observe(document.body, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["open"],
    });
    motion.addEventListener("change", sync);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("wheel", onUserScroll, { passive: true, capture: true });
    window.addEventListener("touchstart", onPointerDown, { passive: true, capture: true });
    window.addEventListener("touchmove", onUserScroll, { passive: true, capture: true });
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("resize", onUserScroll);
    window.addEventListener("popstate", cancelMomentum);
    window.addEventListener("hashchange", cancelMomentum);
    document.addEventListener("click", onAnchorClick);
    sync();

    return () => {
      dialogs.disconnect();
      motion.removeEventListener("change", sync);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("wheel", onUserScroll, true);
      window.removeEventListener("touchstart", onPointerDown, true);
      window.removeEventListener("touchmove", onUserScroll, true);
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("resize", onUserScroll);
      window.removeEventListener("popstate", cancelMomentum);
      window.removeEventListener("hashchange", cancelMomentum);
      document.removeEventListener("click", onAnchorClick);
      temporaryFocusTargets.forEach((restore) => restore());
      navigation = null;
      stop();
    };
  }, [onNavigateStart, onNavigateEnd]);
}
