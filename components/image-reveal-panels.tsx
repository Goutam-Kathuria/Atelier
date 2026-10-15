"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LazyVideo } from "@/components/lazy-video";
import { resolveMediaSrc } from "@/lib/content";

type Theme = "luxury" | "space";

function isVideoMedia(src: string) {
  return /\.(?:mp4|webm|ogg|mov|m4v)(?:[?#].*)?$/i.test(src);
}

export function ImageRevealPanels({ theme, config }: { theme: Theme; config: any }) {
  const ref = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);
  const images = config.images || [];

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let raf = 0;
    let currentProgress = 0;
    let initialized = false;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const value = node.querySelector<HTMLElement>("[data-reveal-value]");

    const render = () => {
      raf = 0;
      const rect = node.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      const targetProgress = Math.max(0, Math.min(1, -rect.top / span));

      // Set the initial scroll state immediately; ease later updates so wheel/touch
      // input does not make the visual reveal jump ahead of the scroll percentage.
      if (!initialized || reduceMotion) {
        currentProgress = targetProgress;
        initialized = true;
      } else {
        currentProgress += (targetProgress - currentProgress) * 0.14;
        if (Math.abs(targetProgress - currentProgress) < 0.0005) {
          currentProgress = targetProgress;
        }
      }

      node.style.setProperty("--reveal", currentProgress.toFixed(4));
      if (value) value.textContent = `${String(Math.round(currentProgress * 100)).padStart(3, "0")}%`;

      if (!reduceMotion && Math.abs(targetProgress - currentProgress) >= 0.0005) {
        raf = requestAnimationFrame(render);
      }
    };

    const scheduleRender = () => {
      if (!raf) raf = requestAnimationFrame(render);
    };

    render();
    window.addEventListener("scroll", scheduleRender, { passive: true });
    window.addEventListener("resize", scheduleRender);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", scheduleRender);
      window.removeEventListener("resize", scheduleRender);
    };
  }, []);

  useEffect(() => {
    if (!images.length) {
      setReady(true);
      return;
    }

    let active = true;
    let count = 0;
    const complete = () => {
      if (!active) return;
      count += 1;
      setLoaded(count);
      if (count >= images.length) setReady(true);
    };

    const cleanups: Array<() => void> = [];
    images.forEach((src: string) => {
      if (isVideoMedia(src)) {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadeddata = complete;
        video.onerror = complete;
        video.src = resolveMediaSrc(src);
        cleanups.push(() => {
          video.onloadeddata = null;
          video.onerror = null;
          video.removeAttribute("src");
          video.load();
        });
      } else {
        const image = new Image();
        image.onload = complete;
        image.onerror = complete;
        image.src = resolveMediaSrc(src);
        cleanups.push(() => {
          image.onload = null;
          image.onerror = null;
        });
      }
    });

    return () => {
      active = false;
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [images.join("|")]);

  return (
    <section
      ref={ref}
      className={`image-reveal-section ${theme}`}
      style={{ "--reveal": 0 } as CSSProperties}
    >
      <div className="reveal-stage">
        <div className={`reveal-wait ${ready ? "is-ready" : ""}`} aria-hidden={ready}>
          <span>{theme === "luxury" ? "ATELIER / MATERIAL STUDY" : "NOVA / SYSTEMS IN MOTION"}</span>
          <strong>
            {String(Math.min(loaded, images.length)).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
          </strong>
          <i><b style={{ width: `${images.length ? (loaded / images.length) * 100 : 100}%` }} /></i>
          <small>{ready ? "SEQUENCE READY / SCROLL TO RELEASE" : "LOADING VISUAL SEQUENCE"}</small>
        </div>

        <header className="reveal-title">
          <p className="eyebrow">{config.label}</p>
          <h2>{config.title}</h2>
          <p>{config.copy}</p>
        </header>

        <div className="reveal-panels">
          {images.map((src: string, i: number) => (
            <article className="reveal-panel" key={`${src}-${i}`} style={{ "--i": i } as CSSProperties}>
              {isVideoMedia(src) ? (
                <LazyVideo
                  className="reveal-panel-image reveal-panel-video"
                  src={resolveMediaSrc(src)}
                  poster={config.posterImages?.[i]}
                  label={`${theme} sequence frame ${i + 1}`}
                />
              ) : (
                <img className="reveal-panel-image" src={resolveMediaSrc(src)} alt="" loading="lazy" decoding="async" />
              )}
              <span className="reveal-panel-index">0{i + 1}</span>
            </article>
          ))}
        </div>

        <div className="reveal-progress">
          <span />
          <em data-reveal-value>000%</em>
        </div>

        <div className="reveal-section-nav">
          <span>{theme === "luxury" ? "PRIVATE VIEWING / MATERIAL CONSULTATION" : "CONTINUE THROUGH THE ARCHIVE"}</span>
          <Link
            className={theme === "luxury" ? "lux-button" : "space-button"}
            href={theme === "luxury" ? "/luxury/contact" : "/space/missions"}
          >
            {theme === "luxury" ? "Request a viewing" : "Open mission log"}
            <ArrowUpRight />
          </Link>
        </div>
      </div>
    </section>
  );
}
