import { useEffect } from "react";

// Observe sections once, without running a handler on every scroll frame.
const groups = [
  [".hero-copy > *", "up", 65],
  [".hero-art", "image", 0],
  [".section-heading > *", "up", 90],
  [".product", "up", 90],
  [".story-image, .bar-photo, .location-photo", "image", 0],
  [".story-copy > *", "up", 60],
  [".bar-options > article", "up", 90],
  [".stand-note, .agenda-toolbar, .event-list", "up", 0],
  [".branch", "up", 70],
  [".moments-top > *, .contact-inner > *", "up", 60],
  [".moments-grid > img", "image", 75],
];

export default function useScrollReveal(scope) {
  useEffect(() => {
    const root = scope.current;
    if (!root || !("IntersectionObserver" in window)) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer;
    const elements = new Set();
    const revealed = new Set();

    function reveal(element) {
      element.dataset.revealState = "visible";
      revealed.add(element);
      observer?.unobserve(element);
    }

    function configure() {
      observer?.disconnect();
      if (preference.matches) {
        elements.forEach(reveal);
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) reveal(entry.target);
          });
        },
        { threshold: 0.05, rootMargin: "0px 0px -24px 0px" },
      );

      groups.forEach(([selector, variant, stagger]) => {
        root.querySelectorAll(selector).forEach((element) => {
          if (revealed.has(element)) return;
          const siblings = [...element.parentElement.children].filter(
            (sibling) => sibling.matches(selector),
          );
          const delay = Math.min(siblings.indexOf(element) * stagger, 220);
          element.dataset.reveal = variant;
          element.style.setProperty("--reveal-delay", `${delay}ms`);
          elements.add(element);

          // An anchor or restored scroll position may start partway down the page.
          if (element.getBoundingClientRect().bottom <= 0) reveal(element);
          else {
            element.dataset.revealState = "pending";
            observer.observe(element);
          }
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

    configure();
    preference.addEventListener("change", configure);
    root.addEventListener("focusin", revealFocusedContent);
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", configure);
      root.removeEventListener("focusin", revealFocusedContent);
      elements.forEach((element) => {
        delete element.dataset.reveal;
        delete element.dataset.revealState;
        element.style.removeProperty("--reveal-delay");
      });
    };
  }, [scope]);
}
