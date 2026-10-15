"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { ExperienceScene } from "@/components/experience-scene";
import { ExperienceCursor } from "@/components/experience-cursor";
import { LazyVideo } from "@/components/lazy-video";
import { CollectionMotion } from "@/components/collection-motion";
import { ImageRevealPanels } from "@/components/image-reveal-panels";
import { LuxuryHero } from "@/components/luxury-hero";
import { SpaceHero } from "@/components/space-hero";
import { DeferredScene } from "@/components/deferred-scene";
import { useProgress } from "@react-three/drei";
import {
  defaultContent,
  getOverrides,
  getSessionOverrides,
  navItems,
  resolveContent,
  resolveMediaSrc,
} from "@/lib/content";

type Theme = "luxury" | "space";

function useScrollDirector() {
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    let lastY = window.scrollY;
    let targetY = lastY;
    let lastObservedY = window.scrollY;
    const nav = document.querySelector<HTMLElement>(".lux-nav, .space-nav");

    // Publish the actual header height so the hero's editorial metadata begins
    // just beneath it at every breakpoint, without hard-coded viewport offsets.
    const measureNav = () => {
      if (nav) root.style.setProperty("--site-nav-height", `${nav.getBoundingClientRect().height}px`);
    };
    measureNav();
    const navObserver = nav && typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(measureNav)
      : null;
    if (nav && navObserver) navObserver.observe(nav);

    // Header direction comes from real scroll events—not eased animation velocity.
    root.dataset.navHidden = "false";
    root.dataset.scrollDirection = "up";

    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const progress = Math.min(Math.max(targetY / max, 0), 1);
      const velocity = targetY - lastY;
      root.style.setProperty("--scroll-y", `${targetY}px`);
      root.style.setProperty("--scroll-progress", String(progress));
      root.style.setProperty("--scroll-velocity", String(Math.max(-18, Math.min(18, velocity))));
      lastY += (targetY - lastY) * 0.16;
      frame = requestAnimationFrame(update);
    };

    const onScroll = () => {
      const nextY = window.scrollY;
      targetY = nextY;
      const delta = nextY - lastObservedY;
      if (Math.abs(delta) >= 2) {
        const direction = delta > 0 ? "down" : "up";
        root.dataset.scrollDirection = direction;
        root.dataset.navHidden = direction === "down" && nextY > 8 ? "true" : "false";
        lastObservedY = nextY;
      } else if (nextY <= 8) {
        root.dataset.navHidden = "false";
        root.dataset.scrollDirection = "up";
        lastObservedY = nextY;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measureNav, { passive: true });
    frame = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(frame);
      navObserver?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measureNav);
      root.style.removeProperty("--site-nav-height");
      delete root.dataset.navHidden;
      delete root.dataset.scrollDirection;
    };
  }, []);
}

function useElementProgress() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = node.getBoundingClientRect();
      const span = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.max(0, Math.min(1, -rect.top / span));
      node.style.setProperty("--element-progress", progress.toFixed(4));
      if (node.classList.contains("space-journey"))
        node.style.setProperty("--journey-progress", progress.toFixed(4));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    update();
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return ref;
}

function CreativeLoader({ theme }: { theme: Theme }) {
  const { progress, active } = useProgress();
  const [minimumDone, setMinimumDone] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const minimum = window.setTimeout(() => setMinimumDone(true), 1100);
    const fallback = window.setTimeout(() => setTimedOut(true), 7000);
    return () => {
      window.clearTimeout(minimum);
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    if (minimumDone && (progress >= 100 || timedOut || !active)) {
      const exit = window.setTimeout(() => setDone(true), 220);
      return () => window.clearTimeout(exit);
    }
  }, [active, minimumDone, progress, timedOut]);

  if (done) return null;
  const loadPercent = Math.max(4, Math.min(100, Math.round(progress)));
  return (
    <div
      className={`experience-loader experience-loader-${theme}`}
      aria-hidden="true"
    >
      <div className="experience-loader-top">
        <span>{theme === "luxury" ? "ATELIER / 09" : "NOVA / 01"}</span>
        <span>INITIALISING</span>
      </div>
      <div className="experience-loader-center">
        <div className="experience-loader-mark">
          <i />
          <i />
          <i />
        </div>
        <p>
          {theme === "luxury" ? "Forging the atelier" : "Establishing signal"}
        </p>
        <strong className="experience-loader-percent">
          {String(loadPercent).padStart(2, "0")}%
        </strong>
      </div>
      <div className="experience-loader-bottom">
        <span>LOAD / 01</span>
        <div>
          <i style={{ transform: `scaleX(${loadPercent / 100})` }} />
        </div>
        <span>{active ? "LOADING" : "LIVE"}</span>
      </div>
    </div>
  );
}

function SceneChapter({
  index,
  eyebrow,
  title,
  copy,
}: {
  index: string;
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <article className="scene-chapter">
      <span>{index}</span>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
        <p>{copy}</p>
      </div>
    </article>
  );
}

function splitLines(value: string) {
  return value.split(/\r?\n/).map((line, index) => (
    <span key={`${line}-${index}`}>
      {line}
      {index < value.split(/\r?\n/).length - 1 && <br />}
    </span>
  ));
}

function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const [enquiry, setEnquiry] = useState("private-viewing");

  const enquiryOptions = [
    ["private-viewing", "Private viewing"],
    ["commission", "Commission"],
    ["material-consultation", "Material consultation"],
    ["general", "General enquiry"],
  ] as const;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      if (!response.ok) throw new Error("Submission failed");
      event.currentTarget.reset();
      setMessage(
        "Your enquiry has been received. We will follow up with the details you provided.",
      );
      setStatus("sent");
    } catch {
      setMessage("The form could not be submitted. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="contact-form-grid">
        <label>
          <span>NAME</span>
          <input
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
          />
        </label>
        <label>
          <span>EMAIL</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
      </div>
      <label>
        <span>ENQUIRY</span>
        <div className="luxury-select">
          <button
            type="button"
            className={`luxury-select-trigger ${enquiryOpen ? "is-open" : ""}`}
            onClick={() => setEnquiryOpen((value) => !value)}
          >
            <span>
              {enquiryOptions.find(([value]) => value === enquiry)?.[1]}
            </span>
            <span className="luxury-select-arrow">⌄</span>
          </button>

          {enquiryOpen && (
            <div className="luxury-select-menu">
              {enquiryOptions.map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={enquiry === value ? "is-selected" : ""}
                  onClick={() => {
                    setEnquiry(value);
                    setEnquiryOpen(false);
                  }}
                >
                  <span>{label}</span>
                  {enquiry === value && <span>✓</span>}
                </button>
              ))}
            </div>
          )}

          <input type="hidden" name="enquiry" value={enquiry} />
        </div>
      </label>
      <label>
        <span>MESSAGE</span>
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Tell us what you are looking for."
        />
      </label>
      <div className="contact-form-submit">
        <button
          className="lux-button"
          type="submit"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Sending…" : "Send enquiry"}
          <ArrowUpRight />
        </button>
        {message && (
          <p
            className={status === "error" ? "form-error" : "form-success"}
            role="status"
          >
            {message}
          </p>
        )}
      </div>
    </form>
  );
}

function RouteScreen({
  theme,
  page,
  data,
  content,
}: {
  theme: Theme;
  page: string;
  data: any;
  content: any;
}) {
  const showEarth = theme === "space" && page === "Explore";
  const [earthReady, setEarthReady] = useState(false);
  const routes = theme === "luxury" ? navItems.luxury : navItems.space;
  const routeIndex =
    Math.max(
      0,
      routes.findIndex(([, label]) => label === page),
    ) + 1;
  const isContact = theme === "luxury" && page === "Contact";
  return (
    <section
      className={`route-screen route-screen-${theme} ${showEarth ? "route-screen-earth" : ""} ${isContact ? "route-screen-contact" : ""}`}
    >
      <div className="route-screen-media">
        <img src={resolveMediaSrc(data.image)} alt="" />
      </div>
      <div className="route-screen-shade" />
      <div className="route-screen-content">
        <p className="eyebrow">{data.tag}</p>
        <h1>{data.title}</h1>
        <p className="route-copy">{data.copy}</p>
        <div className="route-actions">
          <Link
            className={theme === "luxury" ? "lux-button" : "space-button"}
            href={theme === "luxury" ? "/luxury" : "/space"}
          >
            Back to overview <ArrowUpRight />
          </Link>
          <span>
            0{routeIndex} / {page.toUpperCase()}
          </span>
        </div>
        {!isContact && (
          <div className="route-detail-strip">
            <div>
              <span>
                {data.detailLabel ||
                  (theme === "luxury" ? "MATERIAL" : "SYSTEM")}
              </span>
              <b>
                {data.detailValue ||
                  (theme === "luxury"
                    ? "Stone / brass / glass"
                    : "Earth → orbit → deep field")}
              </b>
            </div>
            <div>
              <span>STATUS</span>
              <b>{data.state || "Available by request"}</b>
            </div>
            <div>
              <span>ABOUT</span>
              <b>{data.tag}</b>
            </div>
          </div>
        )}
      </div>
      <aside className="route-screen-aside">
        {isContact ? (
          <ContactForm />
        ) : showEarth ? (
          <div className="route-earth-wrap">
            <div className="route-screen-model">
              <div
                className="route-earth-poster"
                style={{ opacity: earthReady ? 0 : 1 }}
                aria-hidden="true"
              />
              <DeferredScene
                space
                model="earth"
                modelUrl={content.earthModelUrl || undefined}
                onReady={() => setEarthReady(true)}
              />
              <div className="earth-model-caption">
                <span>EARTH / SOL-03</span>
                <b>LIVE ROTATION</b>
              </div>
            </div>
            <div className="route-next-action route-next-action-space">
              {data.actionHref && (
                <Link className="space-button" href={data.actionHref}>
                  {data.actionLabel || "Continue"}
                  <ArrowUpRight />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="route-detail-card">
            <div className="route-detail-card-top">
              <span>0{routeIndex}</span>
              <span>{data.tag}</span>
            </div>
            <div className="route-detail-line" />
            <p>
              {data.sideCopy || "A focused view of this part of the studio."}
            </p>
            <strong>
              {theme === "luxury"
                ? "STUDIO / 2026"
                : `SECTION / ${page.toUpperCase()}`}
            </strong>
            {theme === "space" ? (
              <SpaceRouteModule page={page} content={content} />
            ) : null}
            {theme === "luxury" && data.actionHref && (
              <div className="route-next-action">
                <div className="route-next-copy">
                  <span>NEXT</span>
                  <p>
                    {data.actionCopy ||
                      "Continue to the next part of the studio."}
                  </p>
                </div>
                <Link className="lux-button" href={data.actionHref}>
                  {data.actionLabel || "Continue"}
                  <ArrowUpRight />
                </Link>
              </div>
            )}
          </div>
        )}
      </aside>
    </section>
  );
}

function SpaceRouteModule({ page, content }: { page: string; content: any }) {
  const [selected, setSelected] = useState(0);
  const entries =
    page === "Missions"
      ? content.missions?.items || []
      : page === "Technology"
        ? content.tech?.items || []
        : page === "Future"
          ? (content.timeline?.items || []).map(([year, copy]: string[]) => ({
              year,
              copy,
            }))
          : page === "Origin"
            ? content.journey?.chapters || []
            : content.planets?.items || [];
  const active = entries[selected] || entries[0];
  if (!active) return null;
  const showSelector = page !== "Explore";
  return (
    <div className="space-route-module">
      {showSelector && (
        <div className="space-route-selector">
          {entries.map((entry: any, i: number) => {
            const label =
              page === "Missions"
                ? entry.name
                : page === "Technology"
                  ? entry.title
                  : page === "Future"
                    ? entry.year
                    : page === "Origin"
                      ? entry.title
                      : entry.name;
            return (
              <button
                key={`${label}-${i}`}
                type="button"
                className={selected === i ? "active" : ""}
                onClick={() => setSelected(i)}
              >
                {String(i + 1).padStart(2, "0")} / {label}
              </button>
            );
          })}
        </div>
      )}
      <div className="space-route-detail">
        <span>
          {page === "Missions"
            ? active.status
            : page === "Technology"
              ? active.title
              : page === "Future"
                ? active.year
                : page === "Origin"
                  ? active.eyebrow
                  : active.code}
        </span>
        <strong>
          {page === "Missions"
            ? active.name
            : page === "Technology"
              ? active.title
              : page === "Future"
                ? active.year
                : page === "Origin"
                  ? active.title
                  : active.name}
        </strong>
        <p>
          {page === "Missions"
            ? active.detail
            : page === "Technology"
              ? active.copy
              : page === "Future"
                ? active.copy
                : page === "Origin"
                  ? active.copy
                  : active.copy}
        </p>
      </div>
    </div>
  );
}

function MediaInterlude({ theme, config }: { theme: Theme; config: any }) {
  return (
    <section className={`media-interlude media-interlude-${theme}`}>
      {config.image && (
        <img
          className="media-interlude-image"
          src={resolveMediaSrc(config.image)}
          alt=""
          loading="lazy"
          decoding="async"
        />
      )}
      <LazyVideo
        className="media-interlude-video"
        src={resolveMediaSrc(config.video)}
        poster={resolveMediaSrc(config.image)}
        label={`${theme} cinematic background film`}
      />
      <div className="media-interlude-shade" />
      <div className="media-interlude-copy">
        <p className="eyebrow">{config.label}</p>
        <h2>{config.title}</h2>
        <p>{config.copy}</p>
      </div>
      <span className="media-interlude-index">SCROLL / LIVE FILM</span>
    </section>
  );
}

function isVideoMedia(src: string) {
  return /\.(?:mp4|webm|ogg|mov|m4v)(?:[?#].*)?$/i.test(src);
}

function FooterMarquee({ text }: { text: string }) {
  const copies = [text, text, text, text];
  return (
    <div className="footer-marquee" aria-hidden="true">
      <div className="footer-marquee-track">
        {copies.map((copy, i) => (
          <span key={`${copy}-${i}`}>{copy}</span>
        ))}
      </div>
    </div>
  );
}

function LuxuryFooter({ config }: { config: any }) {
  return (
    <footer className="lux-footer">
      <FooterMarquee text={config.marquee} />
      <div className="footer-content">
        <div className="footer-lead">
          <p className="eyebrow">{config.eyebrow}</p>
          <h3>
            {config.titleLead}
            <br />
            <em>{config.titleEmphasis}</em>
          </h3>
          <p>{splitLines(config.body)}</p>
        </div>
        <div className="footer-column">
          <h3>{config.visitTitle}</h3>
          {(config.visitLinks || []).map(([label, href]: string[]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </div>
        <div className="footer-column">
          <h3>{config.exploreTitle}</h3>
          {(config.exploreLinks || []).map(([label, href]: string[]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <p>{config.copyright}</p>
        <span>
          {config.bottomNote} <b>↗</b>
        </span>
      </div>
    </footer>
  );
}

function SpaceFooter({ config }: { config: any }) {
  return (
    <footer className="space-footer">
      <FooterMarquee text={config.marquee} />
      <div className="footer-content">
        <div className="footer-lead">
          <p className="space-eyebrow">{config.eyebrow}</p>
          <h3>
            {config.titleLead}
            <br />
            <em>{config.titleEmphasis}</em>
          </h3>
          <p>{splitLines(config.body)}</p>
        </div>
        <div className="footer-column">
          <h3>{config.transmitTitle}</h3>
          {(config.transmitLinks || []).map(([label, href]: string[]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </div>
        <div className="footer-column">
          <h3>{config.contactTitle}</h3>
          {(config.contactLinks || []).map(([label, href]: string[]) => (
            <Link key={href} href={href}>
              {label}
            </Link>
          ))}
        </div>
      </div>
      <div className="footer-bottom">
        <p>{config.copyright}</p>
        <span>
          {config.bottomNote} <b>↗</b>
        </span>
      </div>
    </footer>
  );
}

function useExperienceContent(theme: Theme) {
  const defaults = defaultContent[theme];
  const [content, setContent] = useState<any>(defaults);
  useEffect(() => {
    let alive = true;
    const apply = (overrides: any) => {
      if (alive) setContent(resolveContent(defaults, overrides?.[theme] || {}));
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "experience-content") apply(getOverrides<any>());
    };
    getSessionOverrides<any>().then(apply);
    window.addEventListener("storage", onStorage);
    return () => {
      alive = false;
      window.removeEventListener("storage", onStorage);
    };
  }, [theme]);
  return content;
}

export function LuxuryShell({ page = "Overview" }: { page?: string }) {
  useScrollDirector();
  const content = useExperienceContent("luxury");
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);
  if (page !== "Overview")
    return (
      <main className="luxury-page">
        <div
          className="luxury-global-media"
          style={{
            backgroundImage: `url(${resolveMediaSrc(content.backgroundMedia || content.heroImage)})`,
          }}
          aria-hidden="true"
        />
        <CreativeLoader theme="luxury" />
        <ExperienceCursor theme="luxury" />
        <header className="lux-nav lux-nav-light">
          <Link className="wordmark" href="/luxury">
            {content.brand}
          </Link>
          <button
            type="button"
            className="mobile-menu-toggle mobile-menu-toggle-luxury"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="luxury-primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <nav id="luxury-primary-navigation" className={`lux-links ${menuOpen ? "is-open" : ""}`}>
            {(
              content.nav ||
              navItems.luxury.slice(1).map(([label, href]) => [label, href])
            ).map(([label, href]: string[]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
                {label}
              </Link>
            ))}
          </nav>
          <span className="nav-index">{page.toUpperCase()} / 09</span>
        </header>
        <RouteScreen
          theme="luxury"
          page={page}
          data={content.pages?.[page]}
          content={content}
        />
        <LuxuryFooter config={content.footer} />
      </main>
    );
  return (
    <main
      className="luxury-page"
      style={
        {
          "--experience-grain": content.grain ?? 0.18,
          "--hero-height": `${content.heroHeight ?? 100}svh`,
          "--motion-speed": content.animationSpeed ?? 1,
        } as CSSProperties
      }
    >
      <div
        className="luxury-global-media"
        style={{
          backgroundImage: `url(${resolveMediaSrc(content.backgroundMedia || content.heroImage)})`,
        }}
        aria-hidden="true"
      />
      <CreativeLoader theme="luxury" />
      <ExperienceCursor theme="luxury" />
      <header className="lux-nav lux-nav-light">
        <Link className="wordmark" href="/luxury">
          {content.brand}
        </Link>
        <button
          type="button"
          className="mobile-menu-toggle mobile-menu-toggle-luxury"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="luxury-primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav id="luxury-primary-navigation" className={`lux-links ${menuOpen ? "is-open" : ""}`}>
          {(
            content.nav ||
            navItems.luxury.slice(1).map(([label, href]) => [label, href])
          ).map(([label, href]: string[]) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label}
            </Link>
          ))}
        </nav>
        <span className="nav-index">{content.navLabel}</span>
      </header>
      <LuxuryHero content={content} />
      <section id="atelier-story" className="lux-story editorial-story">
        <div className="section-kicker">{content.story.eyebrow}</div>
        <div className="story-grid">
          <div>
            <h2>
              {content.story.titleLead} <em>{content.story.titleEmphasis}</em>{" "}
              {content.story.titleTail}
            </h2>
            <p className="lede">{content.story.lede}</p>
            <p>{content.story.body}</p>
            <Link className="text-link" href={content.story.linkHref}>
              {content.story.linkText}
              <ArrowUpRight />
            </Link>
          </div>
        </div>
        {/* <div className="pull-quote">{content.story.quote}</div> */}
      </section>
      <section className="lux-object">
        <div className="object-copy">
          <p className="eyebrow">{content.object.eyebrow}</p>
          <h2>{content.object.title}</h2>
          <p>{content.object.description}</p>
          <p className="spec-text">
            {splitLines(content.object.specification)}
          </p>
        </div>
        <div className="jewelry-stage">
          <ExperienceScene
            color={content.modelColor}
            model={content.object.model || "jewelry"}
            modelUrl={content.object.modelUrl || undefined}
          />
        </div>
      </section>
      <CollectionMotion config={content.collection} />
      <MediaInterlude theme="luxury" config={content.interlude} />
      <ImageRevealPanels theme="luxury" config={content.reveal} />
      <section className="lux-chapters">
        <p className="eyebrow">{content.chapters.eyebrow}</p>
        <div className="chapter-stack">
          {content.chapters.items.map((item: any) => (
            <SceneChapter key={item.index} {...item} />
          ))}
        </div>
      </section>
      <section className="lux-stats lux-numbers">
        <div className="numbers-intro">
          <p className="eyebrow">{content.stats.eyebrow}</p>
          <h2>
            {content.stats.titleLine1}
            <br />
            <em>{content.stats.titleLine2}</em>
          </h2>
          <p>{content.stats.copy}</p>
        </div>
        <div className="stats-grid">
          {content.stats.items.map(([number, label]: string[]) => (
            <div key={label}>
              <strong>{number}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="lux-cta">
        <div>
          <p className="eyebrow">{content.ctaSection.eyebrow}</p>
          <h2>
            {content.ctaSection.titleLead}{" "}
            <em>{content.ctaSection.titleEmphasis}</em>
          </h2>
          <Link className="lux-button" href={content.ctaSection.buttonHref}>
            {content.ctaSection.button}
            <ArrowUpRight />
          </Link>
        </div>
        <div className="cta-scene">
          <DeferredScene
            delayMs={280}
            color={content.ctaSection.modelColor}
            model="jewelry"
            modelUrl={content.ctaSection.modelUrl || undefined}
          />
        </div>
      </section>
      <LuxuryFooter config={content.footer} />
    </main>
  );
}

export function SpaceShell({ page = "Orbit" }: { page?: string }) {
  useScrollDirector();
  const content = useExperienceContent("space");
  const journeyRef = useElementProgress();
  const [launch, setLaunch] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);
  if (page !== "Orbit")
    return (
      <main
        className="space-page"
        style={
          {
            "--space-earth-image": `url(${resolveMediaSrc(content.backgroundMedia || content.heroImage)})`,
            "--space-route-image": `url(${resolveMediaSrc(content.pages?.Explore?.image || content.heroImage)})`,
          } as CSSProperties
        }
      >
        <div className="space-global-earth" aria-hidden="true" />
        <CreativeLoader theme="space" />
        <ExperienceCursor theme="space" />
        <header className="space-nav">
          <Link className="space-mark" href="/space">
            <span className="mark-orbit" /> {content.brand}
          </Link>
          <button
            type="button"
            className="mobile-menu-toggle mobile-menu-toggle-space"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="space-primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
          <nav id="space-primary-navigation" className={menuOpen ? "is-open" : ""}>
            {(
              content.nav ||
              navItems.space.slice(1).map(([href, label]) => [label, href])
            ).map(([label, href]: string[]) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
                {label.toUpperCase()}
              </Link>
            ))}
            <button className="signal signal-mobile" onClick={() => setLaunch((v) => !v)}>
              {launch ? content.hero.signalLaunch : content.hero.signalIdle}
            </button>
          </nav>
          <button className="signal signal-desktop" onClick={() => setLaunch((v) => !v)}>
            {launch ? content.hero.signalLaunch : content.hero.signalIdle}
          </button>
        </header>
        <RouteScreen
          theme="space"
          page={page}
          data={content.pages?.[page]}
          content={content}
        />
        <SpaceFooter config={content.footer} />
      </main>
    );
  const activePlanet = content.planets.items[0];
  return (
    <main
      className="space-page"
      style={
        {
          "--space-accent": activePlanet?.color,
          "--space-earth-image": `url(${resolveMediaSrc(content.backgroundMedia || content.heroImage)})`,
          "--space-route-image": `url(${resolveMediaSrc(content.pages?.Explore?.image || content.heroImage)})`,
        } as CSSProperties
      }
    >
      <div className="space-global-earth" aria-hidden="true" />
      <CreativeLoader theme="space" />
      <ExperienceCursor theme="space" />
      <header className="space-nav">
        <Link className="space-mark" href="/space">
          <span className="mark-orbit" /> {content.brand}
        </Link>
        <button
          type="button"
          className="mobile-menu-toggle mobile-menu-toggle-space"
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="space-primary-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav id="space-primary-navigation" className={menuOpen ? "is-open" : ""}>
          {(
            content.nav ||
            navItems.space.slice(1).map(([href, label]) => [label, href])
          ).map(([label, href]: string[]) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
              {label.toUpperCase()}
            </Link>
          ))}
          <button className="signal signal-mobile" onClick={() => setLaunch((v) => !v)}>
            {launch ? content.hero.signalLaunch : content.hero.signalIdle}
          </button>
        </nav>
        <button className="signal signal-desktop" onClick={() => setLaunch((v) => !v)}>
          {launch ? content.hero.signalLaunch : content.hero.signalIdle}
        </button>
      </header>
      <SpaceHero
        content={content}
        activePlanet={activePlanet}
        launch={launch}
      />
      <section ref={journeyRef} className="space-journey space-depth">
        <div className="space-label">{content.journey.label}</div>
        <h2>
          {content.journey.titleLead}{" "}
          <span>{content.journey.titleEmphasis}</span>{" "}
          {content.journey.titleTail}
        </h2>
        <p>{content.journey.copy}</p>
        <div className="journey-line">
          {content.journey.stops.map((stop: string, i: number) => (
            <span key={stop}>{stop}</span>
          ))}
          {content.journey.stops.slice(0, -1).map((stop: string) => (
            <i key={`${stop}-line`} />
          ))}
          <b className="journey-route-dot" aria-hidden="true" />
        </div>
        <div className="space-chapters">
          {content.journey.chapters.map((item: any) => (
            <SceneChapter key={item.index} {...item} />
          ))}
        </div>
      </section>
      <section className="planet-section space-command">
        <div className="planet-copy">
          <p className="space-eyebrow">{content.planets.eyebrow}</p>
          <h2>
            {content.planets.titleLead}{" "}
            <span>{content.planets.titleEmphasis}</span>
          </h2>
          <p>{content.planets.copy}</p>
        </div>
        <div className="planet-grid">
          {content.planets.items.map((p: any, i: number) => (
            <article key={p.name} className="planet-card">
              <div
                className="planet-dot"
                style={{ backgroundColor: p.color }}
              />
              <span className="planet-index">0{i + 1}</span>
              <h3>{p.name}</h3>
              <p>{p.copy}</p>
              <code>{p.code} / ARCHIVE REFERENCE</code>
            </article>
          ))}
        </div>
      </section>
      <section className="mission-section">
        <div className="space-label">{content.missions.label}</div>
        <h2>{content.missions.title}</h2>
        <div className="mission-grid">
          {content.missions.items.map((mission: any, i: number) => (
            <Link
              className="mission-card"
              key={mission.id}
              href="/space/missions"
              onClick={() => setLaunch(true)}
            >
              <span className="mission-year">
                MISSION 0{i + 1} / {mission.id}
              </span>
              <h3>{mission.name}</h3>
              <p>{mission.detail}</p>
              <strong>{mission.status}</strong>
              <b className="card-arrow">↗</b>
            </Link>
          ))}
        </div>
      </section>
      <section className="space-tech">
        <div className="space-label">{content.tech.label}</div>
        <h2>{content.tech.title}</h2>
        <div className="tech-grid">
          {content.tech.items.map((tech: any, i: number) => (
            <article className="tech-card" key={`${tech.title}-${i}`}>
              <span>0{i + 1}</span>
              <h3>{tech.title}</h3>
              <p>{tech.copy}</p>
              <div className="tech-meter">
                <i style={{ width: `${tech.meter}%` }} />
              </div>
              <small>SYSTEM / NOMINAL</small>
            </article>
          ))}
        </div>
      </section>
      <MediaInterlude theme="space" config={content.interlude} />
      <ImageRevealPanels theme="space" config={content.reveal} />
      <section className="space-stats">
        <p className="space-eyebrow">{content.stats.eyebrow}</p>
        <div className="stats-grid">
          {content.stats.items.map(([number, label]: string[]) => (
            <div key={label}>
              <strong>{number}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="space-timeline">
        <div className="space-label">{content.timeline.label}</div>
        <h2>{content.timeline.title}</h2>
        <div className="timeline">
          {content.timeline.items.map(([year, copy]: string[], i: number) => (
            <div
              key={`${year}-${copy}`}
              style={{ "--delay": `${i * 80}ms` } as CSSProperties}
            >
              <span>{year}</span>
              <p>{copy}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="space-cta">
        <div>
          <DeferredScene
            delayMs={420}
            space
            model="orbiter"
            color={content.ctaSection.modelColor}
            launch={launch}
          />
        </div>
        <div>
          <p className="space-eyebrow">{content.ctaSection.eyebrow}</p>
          <h2>
            {content.ctaSection.titleLead}{" "}
            <span>{content.ctaSection.titleEmphasis}</span>
          </h2>
          <button className="space-button" onClick={() => setLaunch(true)}>
            {content.ctaSection.button}
            <ArrowUpRight />
          </button>
        </div>
      </section>
      <SpaceFooter config={content.footer} />
    </main>
  );
}
