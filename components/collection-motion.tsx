"use client";

import { useEffect, useRef, useState } from "react";
import { resolveMediaSrc } from "@/lib/content";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

function isVideoMedia(src: string) {
  return /(?:\.mp4|\.webm|\.ogg|\.mov|\.m4v)(?:[?#].*)?$/i.test(src) || /pexels\.com\/download\/video\//i.test(src);
}

function CollectionMedia({ src, index, className = "collection-background-media" }: { src: string; index: number; className?: string }) {
  const resolved = resolveMediaSrc(src);
  if (!resolved) return null;
  if (isVideoMedia(resolved)) {
    return (
      <video
        className={className}
        src={resolved}
        autoPlay
        muted
        loop
        playsInline
        preload={index === 0 ? "auto" : "metadata"}
        aria-hidden="true"
      />
    );
  }
  return (
    <img
      className={className}
      src={resolved}
      alt=""
      loading={index === 0 ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

export function CollectionMotion({ config }: { config: any }) {
  const ref = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let raf = 0;
    let target = 0;
    let current = 0;

    const smooth = (value: number) => value * value * (3 - 2 * value);
    const tick = () => {
      current += (target - current) * 0.095;
      const crossfade = smooth(Math.max(0, Math.min(1, (current - 0.50) / 0.12)));
      node.style.setProperty("--collection-progress", current.toFixed(4));
      node.style.setProperty("--collection-bg0", (1 - crossfade).toFixed(4));
      node.style.setProperty("--collection-bg1", crossfade.toFixed(4));
      const next = current < 0.50 ? 0 : 1;
      setPhase((previous) => (previous === next ? previous : next));
      if (Math.abs(target - current) > 0.001) raf = requestAnimationFrame(tick);
      else raf = 0;
    };

    const update = () => {
      const rect = node.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      target = Math.max(0, Math.min(1, -rect.top / span));
      if (!raf) raf = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const titles = config.phaseTitles?.length
    ? config.phaseTitles
    : [[config.eyebrow, "The archive keeps moving."]];

  return (
    <section ref={ref} className="lux-collection-motion" style={{ "--collection-progress": 0 } as CSSProperties}>
      <div className="collection-sticky">
        <div className="collection-background" aria-hidden="true">
          {(config.backgroundImages || []).slice(0, 2).map((src: string, i: number) => (
            <div
              key={`${src}-${i}`}
              className={`collection-background-layer collection-background-layer-${i}`}
              style={{ opacity: `var(--collection-bg${i}, ${i === 0 ? 1 : 0})` }}
            >
              <CollectionMedia src={src} index={i} />
            </div>
          ))}
        </div>
        <div className="collection-background-shade" />

        <div className="collection-topline">
          <span>{config.topLeft}</span>
          <span>{config.topRight}</span>
        </div>

        <div className="collection-scene-copy" aria-live="polite">
          <span>{config.sceneKicker}</span>
          <strong key={phase}>{titles[phase]?.[0]}</strong>
          <p key={`phase-${phase}`}>{titles[phase]?.[1]}</p>
        </div>

        <header className="collection-title">
          <p className="eyebrow">{config.eyebrow}</p>
          <h2>{config.titleLine1}<br /><em>{config.titleEmphasis}</em></h2>
          <p>{config.copy}</p>
        </header>

        <div className="collection-track">
          {(config.items || []).map((item: any, i: number) => (
            <article className="collection-card" key={`${item.title}-${i}`}>
              <div className="collection-card-media">
                <CollectionMedia src={item.image || ""} index={i} className="collection-card-asset" />
              </div>
              <div className="collection-card-copy">
                <span>0{i + 1} / {item.edition || "ATELIER EDITION"}</span>
                <h3>{item.title}</h3>
                <p>{item.label}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="collection-meter">
          <span />
          <b>0{phase + 1} / 02</b>
        </div>

        <div className="collection-contact">
          <span>PRIVATE VIEWINGS · COMMISSIONS · MATERIAL CONSULTATION</span>
          <Link className="lux-button" href="/luxury/contact">
            Contact the studio <ArrowUpRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
