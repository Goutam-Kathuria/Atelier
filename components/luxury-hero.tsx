"use client";

import { useLayoutEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import { resolveMediaSrc } from "@/lib/content";

export function LuxuryHero({ content }: { content: any }) {
  const hero = content.hero || {};
  const line1 = hero.line1 || content.title || "Objects of";
  const line2 = hero.line2 || "desire.";
  const mediaValue =
    typeof hero.media === "string"
      ? hero.media
      : hero.video === ""
        ? ""
        : typeof hero.video === "string"
          ? hero.video
          : hero.poster || content.heroVideo;
  const poster = typeof hero.poster === "string" ? hero.poster : "";
  const mediaSrc = resolveMediaSrc(mediaValue);
  // The optional stage poster can tint the entire hero; the video poster is only
  // a frame fallback for the inline film while the MP4 buffers.
  const posterSrc = resolveMediaSrc(poster);
  const videoPosterSrc = resolveMediaSrc(
    typeof hero.videoPoster === "string" && hero.videoPoster
      ? hero.videoPoster
      : poster,
  );
  const isVideo = /(?:\.mp4|\.webm|\.ogg|\.mov|\.m4v)(?:[?#].*)?$/i.test(mediaSrc) || /pexels\.com\/(?:download\/video|video)\//i.test(mediaSrc);

  const heroRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const videoSlotRef = useRef<HTMLSpanElement>(null);
  const videoLayerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const footRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = heroRef.current;
    const stage = stageRef.current;
    const slot = videoSlotRef.current;
    const layer = videoLayerRef.current;
    const heading = headingRef.current;
    const foot = footRef.current;
    if (!section || !stage || !heading || !foot || !layer || !slot) return;

    let scrollFrame = 0;
    let initialized = false;
    let disposed = false;
    let startLeft = 0;
    let startTop = 0;
    let startWidth = 0;
    let startHeight = 0;
    let stageWidth = 0;
    let stageHeight = 0;
    let lastTouchY: number | null = null;

    const getScrollBounds = () => {
      // Use the actual sticky-stage height, not window.innerHeight: mobile browser
      // chrome can change innerHeight during a gesture while 100svh stays stable.
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, section.offsetHeight - stage.offsetHeight);
      return { top: sectionTop, end: sectionTop + travel };
    };

    const measure = () => {
      const stageRect = stage.getBoundingClientRect();
      const slotRect = slot.getBoundingClientRect();
      stageWidth = stageRect.width;
      stageHeight = stageRect.height;
      startLeft = slotRect.left - stageRect.left;
      startTop = slotRect.top - stageRect.top;
      startWidth = slotRect.width;
      startHeight = slotRect.height;
    };

    const setLayer = (
      left: number,
      top: number,
      width: number,
      height: number,
      radius: number,
      shadow: number,
    ) => {
      layer.style.left = `${left}px`;
      layer.style.top = `${top}px`;
      layer.style.width = `${width}px`;
      layer.style.height = `${height}px`;
      layer.style.borderRadius = `${radius}px`;
      layer.style.boxShadow = `0 28px 90px rgba(0,0,0,${shadow})`;
    };

    const updateFromScroll = () => {
      scrollFrame = 0;
      if (!initialized || disposed) return;

      const { top, end } = getScrollBounds();
      const travel = Math.max(1, end - top);
      const raw = Math.min(1, Math.max(0, (window.scrollY - top) / travel));
      const eased = raw * raw * (3 - 2 * raw);

      section.style.setProperty("--hero-progress", raw.toFixed(4));
      heading.style.opacity = String(Math.max(0, 1 - eased / 0.62));
      foot.style.opacity = String(Math.max(0, 1 - eased / 0.78));
      setLayer(
        startLeft * (1 - eased),
        startTop * (1 - eased),
        startWidth + (stageWidth - startWidth) * eased,
        startHeight + (stageHeight - startHeight) * eased,
        7 * (1 - eased),
        0.32 * (1 - eased),
      );
    };

    const requestScrollUpdate = () => {
      if (!initialized || scrollFrame || disposed) return;
      scrollFrame = requestAnimationFrame(updateFromScroll);
    };

    const scrollInstantly = (y: number) => {
      const root = document.documentElement;
      const previousBehavior = root.style.scrollBehavior;
      root.style.scrollBehavior = "auto";
      window.scrollTo({ top: Math.max(0, y), left: window.scrollX, behavior: "auto" });
      root.style.scrollBehavior = previousBehavior;
      requestScrollUpdate();
    };

    const gateScrollDelta = (
      deltaY: number,
      event: { preventDefault: () => void },
    ) => {
      if (!initialized || disposed || !Number.isFinite(deltaY) || Math.abs(deltaY) < 0.5) return;

      const { top, end } = getScrollBounds();
      const currentY = window.scrollY;

      // Before entering the pinned hero, retain normal page motion. If a single
      // input would cross its start, stop exactly at the start so the next input
      // expands the film instead of allowing the hero to be skipped.
      if (deltaY > 0 && currentY < top) {
        if (currentY + deltaY >= top) {
          event.preventDefault();
          scrollInstantly(top);
        }
        return;
      }

      // On the way back from later sections, stop at the full-frame boundary.
      // The following upward input then begins the reverse inline collapse.
      if (deltaY < 0 && currentY > end) {
        if (currentY + deltaY <= end) {
          event.preventDefault();
          scrollInstantly(end);
        }
        return;
      }

      // Once fully expanded, let the browser scroll normally into the next
      // section. At the start boundary, let upward scrolling return to the page top.
      if ((deltaY > 0 && currentY >= end - 0.5) || (deltaY < 0 && currentY <= top + 0.5)) return;

      // Keep wheel/touch deltas bounded. This prevents one large gesture from
      // jumping past the transition while retaining a direct, scroll-linked feel.
      const magnitude = Math.min(Math.abs(deltaY) * 0.82, 58);
      const step = Math.sign(deltaY) * Math.max(0.5, magnitude);
      const targetY = Math.max(top, Math.min(end, currentY + step));

      event.preventDefault();
      scrollInstantly(targetY);
    };

    const onWheel = (event: WheelEvent) => {
      const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? window.innerHeight
          : 1;
      gateScrollDelta(event.deltaY * unit, event);
    };

    const onTouchStart = (event: TouchEvent) => {
      lastTouchY = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      const currentTouchY = event.touches[0]?.clientY;
      if (currentTouchY === undefined || lastTouchY === null) return;
      const deltaY = lastTouchY - currentTouchY;
      lastTouchY = currentTouchY;
      gateScrollDelta(deltaY, event);
    };

    const onTouchEnd = () => {
      lastTouchY = null;
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable || target.matches("input, textarea, select, button, a, [role='button']"))
      ) return;

      let deltaY = 0;
      if (event.key === "ArrowDown") deltaY = 90;
      else if (event.key === "ArrowUp") deltaY = -90;
      else if (event.key === "PageDown" || event.key === " ") deltaY = 150;
      else if (event.key === "PageUp") deltaY = -150;
      if (deltaY) gateScrollDelta(deltaY, event);
    };

    // First paint is the measured inline frame. The film does not animate from
    // full-screen to small on load; only scroll input controls its expansion.
    const initialize = () => {
      if (disposed) return;
      measure();
      initialized = true;
      section.style.setProperty("--hero-progress", "0");
      layer.style.transition = "none";
      layer.style.visibility = "visible";
      layer.style.opacity = "1";
      setLayer(startLeft, startTop, startWidth, startHeight, 7, 0.32);
      heading.style.opacity = "1";
      foot.style.opacity = "1";
      updateFromScroll();
    };

    const resizeObserver = new ResizeObserver(() => {
      measure();
      requestScrollUpdate();
    });

    resizeObserver.observe(stage);
    resizeObserver.observe(heading);
    window.addEventListener("scroll", requestScrollUpdate, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    const onResize = () => {
      measure();
      requestScrollUpdate();
    };
    window.addEventListener("resize", onResize);

    void (document.fonts?.ready ?? Promise.resolve()).then(() => {
      if (disposed) return;
      requestAnimationFrame(() => requestAnimationFrame(initialize));
    });

    return () => {
      disposed = true;
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", requestScrollUpdate);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [mediaSrc]);

  return (
    <section ref={heroRef} className="lux-hero luxury-hero-editorial luxury-hero-reveal">
      <div ref={stageRef} className="luxury-hero-stage">
        <div
          className="luxury-hero-poster"
          style={posterSrc ? { backgroundImage: `url("${posterSrc}")` } : undefined}
          aria-hidden="true"
        />

        <div className="luxury-hero-grid" aria-hidden="true" />

        <div className="luxury-hero-topline">
          <span>{hero.eyebrow || content.meta?.eyebrow || "01 / OVERVIEW"}</span>
          <span>{content.brand}</span>
        </div>

          <div className="luxury-hero-content">
          <div ref={headingRef} className="luxury-hero-heading" style={mediaSrc ? { opacity: 0 } : undefined}>
            <span className="luxury-hero-line">{line1}</span>
            <span className="luxury-hero-line luxury-hero-media-line">
              <span>{line2}</span>
              {mediaSrc ? <span ref={videoSlotRef} className="luxury-hero-video-slot" aria-hidden="true" /> : null}
            </span>
          </div>

          <div ref={footRef} className="luxury-hero-foot" style={mediaSrc ? { opacity: 0 } : undefined}>
            <p>{hero.supporting || content.subtitle}</p>
            <a href="#atelier-story">
              <span>{hero.scrollLabel || "SCROLL TO EXPLORE"}</span>
              <ArrowDown />
            </a>
          </div>
        </div>

        {mediaSrc ? (
          <div
            ref={videoLayerRef}
            className={`luxury-hero-video-layer ${!isVideo ? "is-image" : ""}`}
            style={mediaSrc ? { visibility: "hidden", opacity: 0 } : undefined}
          >
            {isVideo ? (
              <video
                key={mediaSrc}
                src={mediaSrc}
                poster={videoPosterSrc || undefined}
                autoPlay
                muted
                loop
                playsInline
                preload="auto"
                aria-hidden="true"
              />
            ) : (
              <img key={mediaSrc} src={mediaSrc} alt="" aria-hidden="true" />
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
