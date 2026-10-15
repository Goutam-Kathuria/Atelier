"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentProps } from "react";
import { ExperienceScene } from "@/components/experience-scene";

export function DeferredScene({ delayMs = 0, ...props }: ComponentProps<typeof ExperienceScene> & { delayMs?: number }) {
  const [ready, setReady] = useState(false);
  const holder = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = holder.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      setReady(true);
      return;
    }

    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = window.setTimeout(() => setReady(true), delayMs);
      },
      { rootMargin: "360px 0px" },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (timer) window.clearTimeout(timer);
    };
  }, [delayMs]);

  return (
    <div ref={holder} className={`scene-deferred ${props.space ? "scene-deferred-space" : "scene-deferred-luxury"}`}>
      {ready ? (
        <ExperienceScene {...props} />
      ) : (
        <div className="scene-deferred-placeholder" aria-hidden="true">
          <span className="scene-load-ring" />
          <span className="scene-load-label">{props.space ? "ASSET / SYNC" : "OBJECT / FORMING"}</span>
        </div>
      )}
    </div>
  );
}
