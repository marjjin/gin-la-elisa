import { useEffect, useRef } from "react";

const easing = "cubic-bezier(0.22, 1, 0.36, 1)";
const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function AnimatedDialog({
  open,
  contentKey,
  onClose,
  children,
}) {
  const ref = useRef(null);
  const animation = useRef(null);
  const closing = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    animation.current?.cancel();
    closing.current = false;
    delete dialog.dataset.closing;

    if (!open) {
      if (dialog.open) dialog.close();
      return;
    }

    const alreadyOpen = dialog.open;
    if (!alreadyOpen) dialog.showModal();
    dialog.scrollTop = 0;

    if (!prefersReducedMotion()) {
      const target = alreadyOpen
        ? dialog.querySelector(".dialog-content")
        : dialog;
      if (target?.animate) {
        animation.current = target.animate(
          [
            {
              opacity: 0,
              transform: alreadyOpen
                ? "translateY(10px)"
                : "translateY(24px) scale(0.97)",
            },
            { opacity: 1, transform: "translateY(0) scale(1)" },
          ],
          { duration: alreadyOpen ? 240 : 360, easing },
        );
      }
    }

    return () => animation.current?.cancel();
  }, [open, contentKey]);

  function requestClose() {
    const dialog = ref.current;
    if (!dialog.open || closing.current) return;
    if (prefersReducedMotion() || !dialog.animate) {
      dialog.close();
      return;
    }

    closing.current = true;
    const { opacity, transform } = getComputedStyle(dialog);
    animation.current?.cancel();
    dialog.dataset.closing = "true";
    animation.current = dialog.animate(
      [
        { opacity, transform },
        { opacity: 0, transform: "translateY(14px) scale(0.985)" },
      ],
      { duration: 180, easing: "cubic-bezier(0.4, 0, 1, 1)", fill: "forwards" },
    );
    animation.current.finished.then(
      () => dialog.close(),
      () => {}, // Cancelled when the dialog unmounts or its content changes.
    );
  }

  return (
    <dialog
      ref={ref}
      className="detail-dialog"
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) requestClose();
      }}
    >
      <button
        className="dialog-close"
        onClick={requestClose}
        aria-label="Cerrar ventana"
      >
        <svg
          className="icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="m6 6 12 12M6 18 18 6" />
        </svg>
      </button>
      {children(requestClose)}
    </dialog>
  );
}
