import { useEffect } from "react";

export function useLockBodyScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const { body, documentElement: html } = document;

    const prevOverflow = body.style.overflow;
    const prevOverscroll = html.style.overscrollBehavior;

    body.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = prevOverflow;
      html.style.overscrollBehavior = prevOverscroll;
    };
  }, [locked]);
}
