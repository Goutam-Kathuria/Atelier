"use client";

import { useEffect, useRef, useState } from "react";
import { resolveMediaSrc } from "@/lib/content";

type LazyVideoProps = {
  className: string;
  src?: string;
  poster?: string;
  label?: string;
};

export function LazyVideo({ className, src, poster, label }: LazyVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(false);
  const resolvedSrc = resolveMediaSrc(src);

  useEffect(() => {
    const node = ref.current;
    if (!node || !src) return;
    if (!("IntersectionObserver" in window)) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          node.play().catch(() => undefined);
        } else {
          node.pause();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      className={className}
      autoPlay
      muted
      loop
      playsInline
      preload={active ? "metadata" : "none"}
      poster={resolveMediaSrc(poster)}
      aria-label={label}
    >
      {active && src ? <source src={resolvedSrc} /> : null}
    </video>
  );
}
