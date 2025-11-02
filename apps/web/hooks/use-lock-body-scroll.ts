import { useEffect } from "react";

function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const { body, documentElement: html } = document;

    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    const prevOverscroll = html.style.overscrollBehavior;

    // ancho de la barra de scroll (0 en macOS overlay, móvil, etc.)
    const scrollBarWidth = window.innerWidth - html.clientWidth;

    body.style.overflow = "hidden";
    if (scrollBarWidth > 0) {
      // evita “salto” horizontal al ocultar scroll
      body.style.paddingRight = `${scrollBarWidth}px`;
    }
    // frena “rebote” en móviles
    html.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
      html.style.overscrollBehavior = prevOverscroll;
    };
  }, [locked]);
}

export default useLockBodyScroll;
