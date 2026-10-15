"use client";

import { DeferredScene } from "@/components/deferred-scene";

export function SpaceHero({ content, activePlanet, launch }: { content: any; activePlanet: any; launch: boolean }) {
  const hero = content.hero || {};
  return (
    <section className="space-hero cinematic-hero">
      <DeferredScene
        delayMs={350}
        space
        color={activePlanet?.color}
        launch={launch}
        model="orbiter"
      />
      <div className="space-hero-minimal">
        <p className="space-eyebrow">{hero.eyebrow}</p>
        <h1>{content.title}</h1>
        <span className="space-hero-rule" />
        <p>{hero.scrollLabel || "SCROLL TO EXPLORE"}</p>
      </div>
      <div className="coordinates">{hero.coordinates?.split(/\r?\n/).map((line: string) => <span key={line}>{line}</span>)}</div>
      <div className="flight-readout">
        <span>{hero.velocityLabel}</span>
        <strong>{launch ? hero.launchedVelocity : hero.idleVelocity}</strong>
        <span>{hero.cameraLink}</span>
      </div>
    </section>
  );
}
