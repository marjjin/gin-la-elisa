import { useEffect } from "react";

// Observe entrances from either direction without handling every scroll frame.
const groups = [
  [".intro-copy > *", "up", 65],
  [".intro-footer", "up", 0],
  [".section-heading > *", "up", 90],
  [".product", "up", 90],
  [".story-image, .bar-photo", "image", 0],
  [".story-copy > *", "up", 60],
  [".bar-options > article", "up", 90],
  [".agenda-toolbar, .event-list", "up", 0],
  [".branch", "up", 70],
  [".gallery-heading > *, .contact-copy > *", "up", 60],
  [".gallery-track, .contact-form-panel", "image", 65],
];

export default function useScrollReveal(scope) {
  useEffect(() => {
    const root = scope.current;
    if (!root || !("IntersectionObserver" in window)) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer;
    const elements = new Set();

    function reveal(element) {
      element.dataset.revealState = "visible";
    }

    function reset(element, bounds) {
      if (element.contains(document.activeElement)) return;
      // Move away from the viewport so the transform cannot trigger reentry.
      element.style.setProperty(
        "--reveal-direction",
        bounds.bottom <= 0 ? "-1" : "1",
      );
      element.dataset.revealState = "pending";
    }

    function configure() {
      observer?.disconnect();
      observer = undefined;
      if (preference.matches) {
        elements.forEach(reveal);
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting || preference.matches) reveal(entry.target);
            else reset(entry.target, entry.boundingClientRect);
          });
        },
        { threshold: 0.05, rootMargin: "0px" },
      );

      groups.forEach(([selector, variant, stagger]) => {
        root.querySelectorAll(selector).forEach((element) => {
          const siblings = [...element.parentElement.children].filter(
            (sibling) => sibling.matches(selector),
          );
          const delay = Math.min(siblings.indexOf(element) * stagger, 220);
          element.dataset.reveal = variant;
          element.style.setProperty("--reveal-delay", `${delay}ms`);
          elements.add(element);

          const bounds = element.getBoundingClientRect();
          const inView = bounds.bottom > 0 && bounds.top < window.innerHeight;
          // Preserve visible content when motion preferences change in place.
          if (inView && element.dataset.revealState === "visible") reveal(element);
          else reset(element, bounds);
          observer.observe(element);
        });
      });
    }

    function revealFocusedContent(event) {
      let element = event.target;
      while (element && element !== root) {
        if (element.dataset?.revealState === "pending") reveal(element);
        element = element.parentElement;
      }
    }

    function rearmBlurredContent(event) {
      const ancestors = [];
      let element = event.target;
      while (element && element !== root) {
        if (elements.has(element)) ancestors.push(element);
        element = element.parentElement;
      }
      // Wait until the browser has moved focus before deciding what can hide.
      queueMicrotask(() => {
        if (!observer || preference.matches) return;
        ancestors.forEach((ancestor) => {
          const bounds = ancestor.getBoundingClientRect();
          if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) {
            reset(ancestor, bounds);
          }
        });
      });
    }

    configure();
    preference.addEventListener("change", configure);
    root.addEventListener("focusin", revealFocusedContent);
    root.addEventListener("focusout", rearmBlurredContent);
    return () => {
      observer?.disconnect();
      observer = undefined;
      preference.removeEventListener("change", configure);
      root.removeEventListener("focusin", revealFocusedContent);
      root.removeEventListener("focusout", rearmBlurredContent);
      elements.forEach((element) => {
        delete element.dataset.reveal;
        delete element.dataset.revealState;
        element.style.removeProperty("--reveal-delay");
        element.style.removeProperty("--reveal-direction");
      });
    };
  }, [scope]);
}
