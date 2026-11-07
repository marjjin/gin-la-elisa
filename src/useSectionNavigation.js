import { useCallback, useEffect, useRef, useState } from "react";

export const sections = [
  { id: "nosotros", label: "Nosotros" },
  { id: "gin", label: "Nuestro gin" },
  { id: "barras", label: "Barras" },
  { id: "agenda", label: "Agenda" },
  { id: "sucursales", label: "Sucursales" },
  { id: "galeria", label: "Galería" },
  { id: "contacto", label: "Contacto" },
];

export default function useSectionNavigation() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const navigating = useRef(false);

  const update = useCallback(() => {
    if (navigating.current) return;
    const elements = sections
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);
    const reference = Math.min(window.innerHeight * 0.25, 200);
    const current = elements
      .filter((element) => element.getBoundingClientRect().top <= reference)
      .at(-1);
    setActiveSection(current?.id || sections[0].id);
  }, []);

  const beginNavigation = useCallback((id) => {
    navigating.current = true;
    setActiveSection(
      sections.some((section) => section.id === id) ? id : sections[0].id,
    );
  }, []);

  const endNavigation = useCallback(() => {
    navigating.current = false;
    update();
  }, [update]);

  useEffect(() => {
    let frame = 0;
    function scheduleUpdate() {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        update();
      });
    }
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    update();
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, [update]);

  return [activeSection, beginNavigation, endNavigation];
}
