export const demoVideo = 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'

// Public, free-to-use Pexels footage selected for the cinematic media slots.
// Use direct MP4 URLs (not the Pexels HTML page) so native <video> can play them.
const luxuryHeroVideo = 'https://videos.pexels.com/video-files/5815082/5815082-hd_1920_1080_25fps.mp4'
const luxuryInterludeVideo = 'https://videos.pexels.com/video-files/6263491/6263491-uhd_3840_2160_25fps.mp4'
const spaceInterludeVideo = 'https://videos.pexels.com/video-files/33453196/14234977_3840_2160_24fps.mp4'
const luxuryVideoPoster = 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1400&q=82'
const luxuryInterludePoster = 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=2200&q=84'
const spaceInterludePoster = 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2200&q=84'

// Default external jewellery model (GLB) from the MIT-licensed 3D ring
// configurator project. Admins can replace it with an uploaded local GLB or
// another direct .glb/.gltf/.fbx URL. The scene has its own safe fallback.
export const defaultJewelryModelUrl = 'https://raw.githubusercontent.com/hp-8/3d-simulator-jewelry/main/public/ring-transformed.glb'

export function resolveMediaSrc(src?: string) {
  if (!src) return ''
  const value = src.trim()
  if (!value) return ''

  // Admin users commonly paste a Pexels video page URL. Pexels also exposes
  // a stable download endpoint for the same asset, so normalize the page URL
  // into a browser-playable source while leaving all other external URLs intact.
  const pexelsVideo = value.match(/^https?:\/\/(?:www\.)?pexels\.com\/video\/(?:[^/]+-)?(\d+)\/?(?:[?#].*)?$/i)
  if (pexelsVideo) return `https://www.pexels.com/download/video/${pexelsVideo[1]}/`

  if (/^(?:https?:|data:|blob:|#)/i.test(value)) return value
  if (value.startsWith('/')) return value
  const clean = value.replace(/^\.\//, '').replace(/^public\//, '')
  if (clean.includes('/')) return `/${clean}`
  return `/media/${clean}`
}

export const defaultContent = {
  luxury: {
    brand: 'ATELIER / 09',
    navLabel: 'OVERVIEW / 09',
    nav: [['Collection', '/luxury/collection'], ['Stories', '/luxury/stories'], ['Services', '/luxury/services'], ['Experience', '/luxury/experience'], ['Contact', '/luxury/contact']],
    title: 'Objects of desire',
    subtitle: 'Fine objects and material studies made in small editions, with close attention to finish and proportion.',
    cta: 'Enter the atelier',
    heroImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=2400&q=90',
    heroVideo: luxuryHeroVideo,
    backgroundMedia: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=2200&q=88',
    modelColor: '#b9874f',
    animationSpeed: 1,
    visible: true,
    cursorMode: 'laser',
    grain: 0.18,
    heroHeight: 100,
    hero: {
      eyebrow: '01 / ATELIER IN MOTION',
      line1: 'Objects of',
      line2: 'desire.',
      supporting: 'Fine objects and material studies made in small editions, with close attention to finish and proportion.',
      media: luxuryHeroVideo,
      video: luxuryHeroVideo,
      poster: '',
      videoPoster: luxuryVideoPoster,
      scrollLabel: 'SCROLL TO ENTER THE ATELIER',
    },
    meta: {
      line1: 'ATELIER / FOR SENSORY OBJECTS',
      line2: 'EST. 2019 / NEW YORK — PARIS',
      eyebrow: '01 / OVERVIEW',
      scroll: 'SCROLL TO EXPLORE',
    },
    story: {
      eyebrow: '02 / THE HOUSE',
      titleLead: 'We make',
      titleEmphasis: 'presence',
      titleTail: 'tangible.',
      lede: 'Atelier 09 develops fine jewelry, small sculptures and interior objects. Each piece is designed with a collected, finished-object feel rather than a mass-produced one.',
      body: 'The studio combines lost-wax casting, blackened metal, stone, enamel and hand-set details. Work is released in small editions and finished by hand.',
      linkText: 'Read the manifesto',
      linkHref: '/luxury/stories',
      orbitLabel: 'FINE OBJECTS / EST. 2019',
      orbitNumber: '09',
      // quote: '“The room changes when an object has a point of view.”',
    },
    object: {
      eyebrow: '03 / SIGNATURE JEWELLERY',
      title: 'The Heirloom Ring',
      description: 'A sculptural precious-metal ring with a brilliant-cut centre stone, polished shoulders and a light-catching setting.',
      specification: 'Polished precious metal / brilliant-cut stone\nSculpted setting / high-jewellery study\nAtelier edition / 2026',
      model: 'jewelry',
      modelUrl: defaultJewelryModelUrl,
    },
    collection: {
      topLeft: '04 / CURRENT WORKS',
      topRight: '06 OBJECTS / 02 SCENES · SCROLL',
      sceneKicker: 'ATELIER / 09',
      phaseTitles: [
        ['A COLLECTION IN MOTION.', 'Relics become atmosphere.'],
        ['A COLLECTION IN MOTION.', 'Gold remembers the hand.'],
        ['A COLLECTION IN MOTION.', 'The archive keeps moving.'],
      ],
      eyebrow: 'A COLLECTION IN MOTION.',
      titleLine1: 'Move through',
      titleEmphasis: 'the vault.',
      copy: 'Move through the current pieces, materials and edition notes. Contact the studio when you are ready to ask about a work.',
      backgroundImages: [
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=2200&q=86',
        'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=2200&q=86',
      ],
      items: [
        { title: 'Crown Relic', image: 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1600&q=82', label: 'Hand-finished object', edition: 'ATELIER EDITION' },
        { title: 'Obsidian Signet', image: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1600&q=82', label: 'Limited material study', edition: 'ATELIER EDITION' },
        { title: 'The Golden Archive', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=82', label: 'Hand-finished object', edition: 'ATELIER EDITION' },
        { title: 'Emerald Relic', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=82', label: 'Limited material study', edition: 'ATELIER EDITION' },
        { title: 'Black Velvet Study', image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1600&q=82', label: 'Hand-finished object', edition: 'ATELIER EDITION' },
        { title: 'Gold / Patina', image: 'https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1600&q=82', label: 'Limited material study', edition: 'ATELIER EDITION' },
      ],
    },
    interlude: {
      label: '05 / A STUDY IN LIGHT',
      title: 'Light, surface and finish.',
      copy: 'A close study of gold, lacquer, stone and shadow. The film supports the material story without hiding the content.',
      image: luxuryInterludePoster,
      video: luxuryInterludeVideo,
    },
    reveal: {
      label: '06 / MATERIAL WEATHER',
      title: 'Material changes under light.',
      copy: 'Move through four material studies. Each image shows a different surface, finish or setting.',
      images: [
        'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1600&q=82',
        'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1600&q=82',
        'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1600&q=82',
        'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1600&q=82',
      ],
    },
    chapters: {
      eyebrow: '07 / THE PROCESS',
      items: [
        { index: '01', eyebrow: 'SOURCE', title: 'Begin with the rare.', copy: 'Stone, brass and metal are selected for finish, colour and how they change under light.' },
        { index: '02', eyebrow: 'SHAPE', title: 'Let the material lead.', copy: 'Form is developed through casting, finishing and repeated adjustment until the surface and proportions are right.' },
        { index: '03', eyebrow: 'PLACE', title: 'Give it a room.', copy: 'The final placement considers scale, light and the space around the object.' },
      ],
    },
    stats: {
      eyebrow: '08 / THE NUMBERS',
      titleLine1: 'Small editions.',
      titleLine2: 'Long lives.',
      copy: "The figures below describe the studio's current scale and material practice.",
      items: [
        ['09', 'objects released'],
        ['31', 'master artisans'],
        ['03', 'continents sourced'],
        ['100', 'year material promise'],
      ],
    },
    ctaSection: {
      eyebrow: '09 / PRIVATE JEWELLERY VIEWING',
      titleLead: 'Discover your',
      titleEmphasis: 'next heirloom.',
      button: 'Request a private viewing',
      buttonHref: '/luxury/contact',
      modelColor: '#8f633b',
      modelUrl: defaultJewelryModelUrl,
    },
    footer: {
      marquee: 'ATELIER / 09 · OBJECTS FOR SLOWER ROOMS ·',
      eyebrow: 'THE HOUSE / 09',
      titleLead: 'Make room',
      titleEmphasis: 'for wonder.',
      body: 'Objects for the long view.\nParis · New York · Everywhere.',
      visitTitle: 'VISIT',
      visitLinks: [
        ['Private viewings', '/luxury/contact'],
        ['The experience', '/luxury/experience'],
        ['Current collection', '/luxury/collection'],
      ],
      exploreTitle: 'EXPLORE',
      exploreLinks: [
        ['Journal', '/luxury/stories'],
        ['Services', '/luxury/services'],
        ['Overview', '/luxury'],
      ],
      copyright: '© 2026 Atelier 09 / All rights reserved',
      bottomNote: 'Designed for the long view',
    },
    pages: {
      Collection: { actionLabel: 'Ask about a piece', actionHref: '/luxury/contact', actionCopy: 'Send the studio a viewing or availability request.', title: 'Current collection.', copy: 'Selected objects shown through material, detail and process. Open a piece, then contact the studio for availability.', tag: 'CURRENT WORKS', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2400&q=88', detailLabel: 'Stone / brass / glass', detailValue: 'Private / limited', state: 'Available by request', sideCopy: 'A focused view of the current collection and the materials behind it.' },
      Stories: { actionLabel: 'Ask the studio', actionHref: '/luxury/contact', actionCopy: 'Send a question about a process, material or past work.', title: 'Studio journal.', copy: 'Notes on materials, fabrication, commissions and finished pieces from the studio archive.', tag: 'THE JOURNAL', image: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2400&q=88', detailLabel: 'Archive / Journal', detailValue: 'Editorial / ongoing', state: 'Updated in studio', sideCopy: 'A working journal covering process, craft and studio decisions.' },
      Services: { actionLabel: 'Start a project enquiry', actionHref: '/luxury/contact', actionCopy: 'Tell the studio about a commission, viewing or consultation.', title: 'Studio services.', copy: 'Private viewings, commissions and material consultations. Start with the enquiry that matches your project.', tag: 'ATELIER SERVICES', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2400&q=88', detailLabel: 'Commission / study', detailValue: 'By request', state: 'Studio availability', sideCopy: 'A clear starting point for commissions and material direction.' },
      Experience: { actionLabel: 'Contact the studio', actionHref: '/luxury/contact', actionCopy: 'Ask about the presentation or arrange a private viewing.', title: 'Inside the studio.', copy: 'A guided look at light, material, sound and motion used in the studio presentation.', tag: 'THE EXPERIENCE', image: 'https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=2400&q=88', detailLabel: 'Light / sound / motion', detailValue: 'Immersive', state: 'Live sequence', sideCopy: 'A guided view of light, sound, material and motion.' },
      Contact: { title: 'Contact the studio.', copy: 'Send an enquiry for a private viewing, commission, material consultation or general question.', tag: 'CONTACT / 09', image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=2400&q=88', detailLabel: 'Private viewing', detailValue: 'New York / Paris', state: 'Open by request', sideCopy: 'Use the form to request a viewing, commission discussion or consultation.' },
    },
  },
  space: {
    brand: 'NOVA / 01',
    navLabel: 'ORBIT / 01',
    nav: [['Origin', '/space/origin'], ['Explore', '/space/explore'], ['Missions', '/space/missions'], ['Technology', '/space/technology'], ['Future', '/space/future']],
    title: 'Beyond the known',
    subtitle: 'A documentary archive of missions, spacecraft and the engineering required to travel farther.',
    cta: 'Begin the mission',
    heroImage: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2400&q=90',
    heroVideo: demoVideo,
    backgroundMedia: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2200&q=88',
    modelColor: '#3b82f6',
    animationSpeed: 1,
    visible: true,
    cursorMode: 'laser',
    grain: 0.15,
    heroHeight: 100,
    earthModelUrl: '',
    hero: {
      eyebrow: 'DEEP SPACE RESEARCH / 2049',
      coordinates: "41° 24' 12.2 N\n02° 10' 26.5 E",
      signalIdle: 'SIGNAL STABLE',
      signalLaunch: 'T-0 LAUNCHED',
      velocityLabel: 'VELOCITY',
      idleVelocity: '0.00C',
      launchedVelocity: '0.42C',
      cameraLink: 'SCROLL / CAMERA LINK',
      scrollLabel: 'SCROLL TO EXPLORE',
    },
    interlude: {
      label: '06 / DEEP FIELD TRANSMISSION',
      title: 'Light arrives as data.',
      copy: 'A quiet field study of distant light, orbital motion and the instruments used to observe it.',
      image: spaceInterludePoster,
      video: spaceInterludeVideo,
    },
    journey: {
      label: '02 — ORIGIN',
      titleLead: 'There is more between',
      titleEmphasis: 'here',
      titleTail: 'and there.',
      copy: 'From launch to orbit to deep-space navigation, each stage is recorded in the mission archive.',
      stops: ['EARTH', 'ORBIT', 'DEEP FIELD'],
      chapters: [
        { index: '01', eyebrow: 'LAUNCH', title: 'Ignition sequence.', copy: 'The vehicle leaves the atmosphere and begins the first stage of flight.' },
        { index: '02', eyebrow: 'ORBIT', title: 'The planet gets small.', copy: 'Guidance systems maintain the planned trajectory as the spacecraft reaches orbit.' },
        { index: '03', eyebrow: 'DEEP SPACE', title: 'Navigation is continuous.', copy: 'Deep-space navigation depends on instruments, telemetry and long-duration communication.' },
      ],
    },
    planets: {
      eyebrow: '03 — CELESTIAL BODIES',
      titleLead: 'Three worlds.',
      titleEmphasis: 'One archive.',
      copy: 'Earth, Mars and Titan are reference bodies in the NOVA archive.',
      items: [
        { name: 'EARTH', code: 'SOL-03', color: '#3b82f6', copy: 'The original vantage point.' },
        { name: 'MARS', code: 'SOL-04', color: '#d45d45', copy: 'A reference target for the Mars mission profile.' },
        { name: 'TITAN', code: 'SAT-06', color: '#c49a52', copy: 'A reference target for the Titan mission profile.' },
      ],
    },
    missions: {
      label: '04 — MISSION LOG',
      title: 'Mission archive.',
      items: [
        { id: '01', name: 'Lunar relay', detail: 'A silent handshake between two horizons.', status: 'COMPLETE' },
        { id: '02', name: 'Ares descent', detail: 'Reading the red planet in a new language.', status: 'IN FLIGHT' },
        { id: '03', name: 'Deep field', detail: 'Listening for the shape of what comes next.', status: 'QUEUED' },
        { id: '2040', name: 'Asteria', detail: 'First autonomous archive beyond the heliopause.', status: 'PLANNED' },
      ],
    },
    tech: {
      label: '05 — INSTRUMENTS',
      title: 'The spacecraft is a system of systems.',
      items: [
        { title: 'Propulsion', copy: 'ion lattice drive', meter: 60 },
        { title: 'Navigation', copy: 'quantum star map', meter: 66 },
        { title: 'Materials', copy: 'ceramic carbon skin', meter: 72 },
        { title: 'Energy', copy: 'closed-loop fusion', meter: 78 },
        { title: 'Communication', copy: 'neutrino relay', meter: 84 },
        { title: 'Life support', copy: 'adaptive ecology', meter: 90 },
      ],
    },
    reveal: {
      label: '07 / SYSTEMS IN MOTION',
      title: 'Watch the machine change state.',
      copy: 'Move through four material studies. Each image shows a different surface, finish or setting.',
      images: [
        'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=1400&q=74',
        'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=74',
        'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1400&q=74',
        'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1400&q=74',
      ],
    },
    stats: {
      eyebrow: '08 / FLIGHT DATA',
      items: [
        ['12.8B', 'kilometres mapped'],
        ['0.42c', 'cruise velocity'],
        ['247', 'days in transit'],
        ['06', 'crew systems'],
      ],
    },
    timeline: {
      label: '09 — TIMELINE',
      title: 'Mission timeline.',
      items: [
        ['2026', 'first signal'],
        ['2028', 'lunar relay'],
        ['2030', 'crew habitat'],
        ['2035', 'Europa flyby'],
        ['2040', 'deep archive'],
      ],
    },
    ctaSection: {
      eyebrow: '10 / FINAL TRANSMISSION',
      titleLead: 'The mission continues',
      titleEmphasis: 'beyond Earth.',
      button: 'Initiate launch',
      modelColor: '#64eaff',
    },
    footer: {
      marquee: 'NOVA / 01 · KEEP LOOKING UP ·',
      eyebrow: 'MISSION CONTROL / 2049',
      titleLead: 'Keep looking',
      titleEmphasis: 'up.',
      body: 'A visual archive of missions, spacecraft and engineering studies.\nArchive status: open.',
      transmitTitle: 'TRANSMIT',
      transmitLinks: [
        ['Mission logs', '/space/missions'],
        ['Technology', '/space/technology'],
        ['The future', '/space/future'],
      ],
      contactTitle: 'CONTACT',
      contactLinks: [
        ['Orbital view', '/space/explore'],
        ['Crew archive', '/space/origin'],
        ['mission@nova.space', 'mailto:mission@nova.space'],
      ],
      copyright: '© 2049 NOVA Space Research / All systems nominal',
      bottomNote: 'Mission archive / 01',
    },
    pages: {
      Origin: { actionLabel: 'Open the mission log', actionHref: '/space/missions', actionCopy: 'Continue from the launch sequence into the mission archive.', title: 'Every journey has an origin.', copy: 'Track the first signal from Earth into orbit and discover how the archive turns distance into a navigable story.', tag: 'ORIGIN / 01', image: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2400&q=88', detailLabel: 'Earth → orbit', detailValue: 'Signal archive', state: 'Telemetry nominal', sideCopy: 'The first archive node in the NOVA navigation system.' },
      Explore: { title: 'Earth from orbit.', copy: 'A live orbital view of Earth, the reference body for the NOVA archive.', tag: 'EXPLORATION', image: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=2400&q=88', detailLabel: 'SOL-03 / ORBIT', detailValue: 'Orbital reference', state: 'Live rotation', sideCopy: 'A live reference view of Earth from low orbit.' },
      Missions: { actionLabel: '', actionHref: '', actionCopy: '', title: 'Mission archive.', copy: 'Selected missions showing launch, navigation, communications and long-duration operations.', tag: 'MISSION CONTROL', image: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=2400&q=88', detailLabel: 'Archive / missions', detailValue: 'Field operations', state: 'Tracking nominal', sideCopy: 'Mission history inside the long-range archive.' },
      Technology: { actionLabel: 'Open the mission log', actionHref: '/space/missions', actionCopy: 'See where each system is used in the mission archive.', title: 'The spacecraft is a system of systems.', copy: 'Propulsion, navigation, materials, energy and communication presented as one connected instrument system.', tag: 'SYSTEMS / 2049', image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2400&q=88', detailLabel: 'Six systems', detailValue: 'Integrated instrument', state: 'Nominal', sideCopy: 'The systems layer behind every mission.' },
      Future: { actionLabel: 'Review current missions', actionHref: '/space/missions', actionCopy: 'Connect the future timeline to the current mission archive.', title: 'Mission timeline.', copy: 'A planning timeline for habitats, relays and deep-space archives across the next fourteen years.', tag: 'FUTURE LOG', image: 'https://images.unsplash.com/photo-1447433819943-74a20887a81e?auto=format&fit=crop&w=2400&q=88', detailLabel: '2026 → 2040', detailValue: 'Long-range sequence', state: 'Open timeline', sideCopy: 'A future log written in decades, not minutes.' },
    },
  },
} as const

export type ExperienceContent = typeof defaultContent

export const sitePages = {
  luxury: defaultContent.luxury.pages,
  space: defaultContent.space.pages,
} as const

export const navItems = {
  luxury: [['/luxury', 'Overview'], ['/luxury/collection', 'Collection'], ['/luxury/stories', 'Stories'], ['/luxury/services', 'Services'], ['/luxury/experience', 'Experience'], ['/luxury/contact', 'Contact']],
  space: [['/space', 'Orbit'], ['/space/origin', 'Origin'], ['/space/explore', 'Explore'], ['/space/missions', 'Missions'], ['/space/technology', 'Technology'], ['/space/future', 'Future']],
} as const

export function resolveContent<T extends Record<string, any>>(defaults: T, overrides: Partial<T> = {}): T {
  const result = structuredClone(defaults) as T
  for (const key of Object.keys(overrides || {})) {
    const value = (overrides as any)[key]
    const base = (defaults as any)[key]
    if (value && typeof value === 'object' && !Array.isArray(value) && base && typeof base === 'object' && !Array.isArray(base)) {
      ;(result as any)[key] = resolveContent(base, value)
    } else if (value !== undefined) {
      ;(result as any)[key] = value
    }
  }

  // Replace only the known previous default clips in saved browser-local content.
  // This allows redeployed sites to pick up the refreshed stock footage without
  // overwriting unrelated user edits made in the admin panel.
  if ((defaults as any)?.brand === defaultContent.luxury.brand) {
    const oldHeroUrls = new Set([
      'https://www.pexels.com/download/video/7430072/',
      'https://www.pexels.com/video/7430072/',
    ])
    const oldInterludeUrls = new Set([
      'https://storage.googleapis.com/coverr-main/mp4/Footboys.mp4',
    ])
    const hero = (result as any).hero
    const oldHeroWasReplaced = Boolean(
      oldHeroUrls.has(String(hero?.media || '')) ||
      oldHeroUrls.has(String(hero?.video || '')) ||
      oldHeroUrls.has(String((result as any).heroVideo || ''))
    )
    if (hero) {
      if (oldHeroUrls.has(String(hero.media || ''))) hero.media = luxuryHeroVideo
      if (oldHeroUrls.has(String(hero.video || ''))) hero.video = luxuryHeroVideo
      if (oldHeroWasReplaced && !hero.videoPoster) hero.videoPoster = luxuryVideoPoster
    }
    if (oldHeroUrls.has(String((result as any).heroVideo || ''))) {
      ;(result as any).heroVideo = luxuryHeroVideo
    }
    const interlude = (result as any).interlude
    if (interlude && oldInterludeUrls.has(String(interlude.video || ''))) {
      interlude.video = luxuryInterludeVideo
      if (!interlude.image) interlude.image = luxuryInterludePoster
    }
  }
  if ((defaults as any)?.brand === defaultContent.space.brand) {
    const interlude = (result as any).interlude
    if (interlude && String(interlude.video || '') === demoVideo) {
      interlude.video = spaceInterludeVideo
      if (!interlude.image) interlude.image = spaceInterludePoster
    }
  }

  // Migrate the old saved lion content once it is loaded through this resolver.
  // Only rewrite content that still carries the exact legacy lion copy; preserve
  // any custom model URL a user has already set, except the old bundled lion path.
  if ((defaults as any)?.brand === defaultContent.luxury.brand && (defaults as any)?.object && (defaults as any)?.ctaSection) {
    const legacyObject = (overrides as any)?.object
    if (legacyObject?.model === 'lion' || legacyObject?.title === 'The Black Panther Study') {
      const oldUrl = String(legacyObject?.modelUrl || '')
      const keepCustomUrl = oldUrl && !/lion-head\.glb/i.test(oldUrl)
      ;(result as any).object = {
        ...(result as any).object,
        eyebrow: defaultContent.luxury.object.eyebrow,
        title: defaultContent.luxury.object.title,
        description: defaultContent.luxury.object.description,
        specification: defaultContent.luxury.object.specification,
        model: 'jewelry',
        modelUrl: keepCustomUrl ? oldUrl : defaultJewelryModelUrl,
      }
      const oldCtaUrl = String((overrides as any)?.ctaSection?.modelUrl || '')
      ;(result as any).ctaSection = {
        ...(result as any).ctaSection,
        modelUrl: oldCtaUrl && !/lion-head\.glb/i.test(oldCtaUrl) ? oldCtaUrl : defaultJewelryModelUrl,
      }
    }
  }

  return result
}

export function getSessionToken() {
  if (typeof window === 'undefined') return null
  let token = localStorage.getItem('experience-session')
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem('experience-session', token)
  }
  return token
}

export function getOverrides<T>() {
  if (typeof window === 'undefined') return {} as Partial<T>
  try {
    return JSON.parse(localStorage.getItem('experience-content') || '{}') as Partial<T>
  } catch {
    return {} as Partial<T>
  }
}

export async function saveOverrides(value: Record<string, unknown>) {
  if (typeof window === 'undefined') return false
  localStorage.setItem('experience-content', JSON.stringify(value))
  const token = getSessionToken()
  if (!token) return false
  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token, content: value }),
    })
    return response.ok
  } catch {
    return false
  }
}

export async function getSessionOverrides<T>() {
  const local = getOverrides<T>()
  if (Object.keys(local as any).length) return local

  const token = getSessionToken()
  if (!token) return {} as Partial<T>

  try {
    const response = await fetch(`/api/session?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
    if (!response.ok) throw new Error('session request failed')
    const data = await response.json()
    if (data.content && Object.keys(data.content).length) {
      localStorage.setItem('experience-content', JSON.stringify(data.content))
      return data.content as Partial<T>
    }
    return {}
  } catch {
    return {}
  }
}

export async function uploadMedia(file: File) {
  const token = getSessionToken()
  if (!token) throw new Error('session unavailable')
  const formData = new FormData()
  formData.append('file', file)
  formData.append('token', token)
  const response = await fetch('/api/media', { method: 'POST', body: formData })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || 'media upload failed')
  return data as { url: string; name: string; type: string; size: number }
}

export async function getMediaLibrary() {
  const token = getSessionToken()
  if (!token) return []
  try {
    const response = await fetch(`/api/media?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
    if (!response.ok) return []
    return (await response.json()).assets || []
  } catch {
    return []
  }
}
