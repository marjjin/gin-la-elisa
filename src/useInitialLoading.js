import { useEffect } from "react";

export default function useInitialLoading() {
  useEffect(() => {
    const loader = document.getElementById("site-loader");
    const root = document.getElementById("root");
    if (!loader || !root) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const initialHash = window.location.hash;
    const timers = new Set();
    let cancelled = false;
    let leaving = false;

    function schedule(callback, delay) {
      const timer = window.setTimeout(callback, delay);
      timers.add(timer);
    }

    function reveal() {
      if (cancelled || leaving) return;
      leaving = true;
      root.removeAttribute("inert");
      root.removeAttribute("aria-busy");
      document.body.removeAttribute("data-loading");
      // Inert content cannot receive the browser's initial fragment navigation.
      if (initialHash && window.location.hash === initialHash) {
        try {
          document.getElementById(decodeURIComponent(initialHash.slice(1)))
            ?.scrollIntoView({ block: "start", behavior: "instant" });
        } catch {
          // Leave malformed fragments to the browser.
        }
      }
      loader.setAttribute("aria-hidden", "true");
      loader.classList.add("is-leaving");
      schedule(() => loader.remove(), motion.matches ? 0 : 450);
    }

    const images = [
      loader.querySelector("img"),
      document.querySelector(".intro-image img"),
    ];

    // Wait for the first view only; below-the-fold photos remain lazy-loaded.
    Promise.allSettled([
      document.fonts.load('400 16px "DM Sans Variable"'),
      document.fonts.load('400 62px "Playfair Display Variable"'),
      document.fonts.load('italic 400 19px "Playfair Display Variable"'),
      document.fonts.ready,
      ...images.map((image) => image?.decode()),
    ]).then(() => {
      if (cancelled) return;
      // Keep fast loads legible without adding a delay to slower connections.
      schedule(reveal, motion.matches ? 0 : Math.max(0, 1400 - performance.now()));
    });

    schedule(reveal, 5500);

    return () => {
      cancelled = true;
      timers.forEach(window.clearTimeout);
    };
  }, []);
}
