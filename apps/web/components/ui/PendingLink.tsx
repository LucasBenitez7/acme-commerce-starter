"use client";
import * as React from "react";

import { cn } from "@/lib/utils";

import { useNavPending } from "@/hooks/use-nav-pending";

export function PendingLink({
  href,
  children,
  className,
  disabled,
  replace,
  scroll,
  title,
  prefetchOnHover = true,
  "aria-label": ariaLabel,
  rel,
  target,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  replace?: boolean;
  scroll?: boolean;
  title?: string;
  prefetchOnHover?: boolean;
  rel?: string;
  target?: string;
  "aria-label"?: string;
}) {
  const { isPending, navigate } = useNavPending();
  const blocked = disabled || isPending;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (target === "_blank" || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    if (blocked) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    navigate(href, { replace, scroll });
  };

  const handleMouseEnter = () => {};

  return (
    <a
      href={href}
      onClick={handleClick}
      onMouseEnter={prefetchOnHover ? handleMouseEnter : undefined}
      aria-disabled={blocked || undefined}
      title={title}
      rel={rel}
      target={target}
      className={cn(blocked && "pointer-events-none opacity-60", className)}
    >
      {children}
    </a>
  );
}
