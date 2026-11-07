import { useEffect, useRef, useState } from "react";
import { Icon, Photo } from "./components";

const edgeTolerance = 2;
const formatCount = (number) => String(number).padStart(2, "0");

function getGeometry(track) {
  const bounds = track.getBoundingClientRect();
  // Reveal transitions can scale the track; scrollLeft remains in CSS pixels.
  const scale = track.offsetWidth ? bounds.width / track.offsetWidth : 1;
  const left = bounds.left + track.clientLeft * scale;
  return {
    scale: scale || 1,
    left,
    right: left + track.clientWidth * scale,
    maximum: Math.max(0, track.scrollWidth - track.clientWidth),
    slides: [...track.querySelectorAll(".gallery-slide")],
  };
}

function getSnapPoints(track) {
  const { scale, left, maximum, slides } = getGeometry(track);
  const padding = parseFloat(getComputedStyle(track).scrollPaddingLeft) || 0;
  return slides
    .map((slide) => {
      const margin = parseFloat(getComputedStyle(slide).scrollMarginLeft) || 0;
      const position =
        track.scrollLeft + (slide.getBoundingClientRect().left - left) / scale -
        padding - margin;
      return Math.max(0, Math.min(maximum, position));
    })
    .filter((point, index, points) =>
      index === 0 || Math.abs(point - points[index - 1]) > edgeTolerance,
    );
}

export default function PhotoGallery({ items, onOpen }) {
  const trackRef = useRef(null);
  const [viewport, setViewport] = useState({
    first: 0,
    last: 0,
    previous: false,
    next: false,
    progress: 0,
  });

  useEffect(() => {
    const track = trackRef.current;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    function measure() {
      frame = 0;
      const { left, right, maximum, slides } = getGeometry(track);
      const visible = slides.flatMap((slide, index) => {
        const bounds = slide.getBoundingClientRect();
        return bounds.right > left + edgeTolerance &&
          bounds.left < right - edgeTolerance ? [index] : [];
      });
      const first = visible[0] ?? 0;
      const next = {
        first,
        last: visible.at(-1) ?? first,
        previous: track.scrollLeft > edgeTolerance,
        next: maximum - track.scrollLeft > edgeTolerance,
        progress: maximum > edgeTolerance
          ? Math.round(Math.max(0, Math.min(1, track.scrollLeft / maximum)) * 1000) / 1000
          : 1,
      };
      setViewport((current) =>
        Object.keys(next).every((key) => current[key] === next[key]) ? current : next,
      );
    }

    function scheduleMeasure() {
      if (!frame) frame = window.requestAnimationFrame(measure);
    }

    function onMotionChange() {
      if (motion.matches) {
        track.scrollTo({ left: track.scrollLeft, behavior: "auto" });
      }
      scheduleMeasure();
    }

    const resize = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(scheduleMeasure);
    resize?.observe(track);
    track.querySelectorAll(".gallery-slide").forEach((slide) => resize?.observe(slide));
    track.addEventListener("scroll", scheduleMeasure, { passive: true });
    track.addEventListener("load", scheduleMeasure, true);
    track.addEventListener("transitionend", scheduleMeasure);
    window.addEventListener("resize", scheduleMeasure);
    motion.addEventListener("change", onMotionChange);
    scheduleMeasure();

    return () => {
      window.cancelAnimationFrame(frame);
      resize?.disconnect();
      track.removeEventListener("scroll", scheduleMeasure);
      track.removeEventListener("load", scheduleMeasure, true);
      track.removeEventListener("transitionend", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      motion.removeEventListener("change", onMotionChange);
    };
  }, [items.length]);

  function scrollTo(left) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({
      left,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }

  function move(direction) {
    const track = trackRef.current;
    if (!track) return;
    const points = getSnapPoints(track);
    const destination = direction > 0
      ? points.find((point) => point > track.scrollLeft + edgeTolerance)
      : points.findLast((point) => point < track.scrollLeft - edgeTolerance);
    if (destination !== undefined) scrollTo(destination);
  }

  function onKeyDown(event) {
    if (
      event.target !== event.currentTarget ||
      event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
    ) return;
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        move(-1);
        break;
      case "ArrowRight":
        event.preventDefault();
        move(1);
        break;
      case "Home":
        event.preventDefault();
        scrollTo(0);
        break;
      case "End":
        event.preventDefault();
        scrollTo(event.currentTarget.scrollWidth - event.currentTarget.clientWidth);
        break;
      default:
        break;
    }
  }

  const first = items.length ? viewport.first + 1 : 0;
  const last = items.length ? viewport.last + 1 : 0;
  const range = first === last
    ? formatCount(first)
    : `${formatCount(first)}–${formatCount(last)}`;

  return (
    <>
      <div className="gallery-heading">
        <div>
          <p className="eyebrow">06 / GALERÍA</p>
          <h2 id="moments-title">La marca en imágenes.</h2>
        </div>
        <p>Botánicos, nuestras botellas y los encuentros.</p>
        <div className="gallery-controls" role="group" aria-label="Recorrer las fotos">
          <button
            type="button"
            className="gallery-arrow gallery-previous"
            aria-label="Fotos anteriores"
            aria-controls="gallery-track"
            disabled={!viewport.previous}
            onClick={() => move(-1)}
          >
            <Icon name="arrow" style={{ transform: "rotate(180deg)" }} />
          </button>
          <button
            type="button"
            className="gallery-arrow gallery-next"
            aria-label="Fotos siguientes"
            aria-controls="gallery-track"
            disabled={!viewport.next}
            onClick={() => move(1)}
          >
            <Icon name="arrow" />
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        id="gallery-track"
        className="gallery-track"
        role="region"
        aria-label="Fotografías de Gin La Elisa"
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {items.map((item) => (
          <figure className="gallery-slide" key={item.name}>
            <button
              type="button"
              className="gallery-photo"
              onClick={() => onOpen(item)}
              aria-label={`Ampliar foto: ${item.caption}`}
            >
              <Photo
                name={item.name}
                alt={item.alt}
                draggable={false}
                style={item.position ? { objectPosition: item.position } : undefined}
                sizes="(max-width: 600px) 82vw, (max-width: 850px) 45vw, (min-width: 1778px) 437px, 28vw"
              />
              <span className="photo-expand"><Icon name="plus" /></span>
            </button>
            <figcaption>{item.caption}</figcaption>
          </figure>
        ))}
      </div>
      <div className="gallery-footer">
        <p
          className="gallery-count"
          aria-live="polite"
          aria-atomic="true"
        >
          <span aria-hidden="true">{range} / {formatCount(items.length)}</span>
          <span className="sr-only">
            {items.length ? `Fotos ${first} a ${last} de ${items.length}` : "Sin fotos"}
          </span>
        </p>
        <div className="gallery-progress" aria-hidden="true">
          <span style={{ width: `${viewport.progress * 100}%` }} />
        </div>
        <p>Deslizá para descubrir más.</p>
      </div>
    </>
  );
}
