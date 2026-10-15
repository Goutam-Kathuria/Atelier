"use client";

import { useEffect, useState } from "react";

import {
  Box,
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  Image as ImageIcon,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  Upload,
  Video,
} from "lucide-react";

import {
  defaultContent,
  getOverrides,
  getSessionOverrides,
  resolveContent,
  saveOverrides,
  uploadMedia,
  getMediaLibrary,
  resolveMediaSrc,
} from "@/lib/content";

type Kind = "luxury" | "space";

type Panel = "dashboard" | "editor" | "media" | "preview";

type Asset = {
  name: string;

  url: string;

  type: string;

  size?: number;

  modifiedAt?: string;
};

type SectionGroup = { id: string; label: string; keys: string[] };

const humanize = (value: string) =>
  value

    .replace(/([a-z])([A-Z])/g, "$1 $2")

    .replace(/[_-]+/g, " ")

    .replace(/\b\w/g, (c) => c.toUpperCase());

const isMediaField = (key: string) =>
  /(image|video|media|poster|background|asset)/i.test(key) &&
  !/(href|link)/i.test(key);

const isLongText = (key: string, value: string) =>
  value.length > 80 ||
  /(copy|description|subtitle|body|quote|specification|detail|text|title|lede|label)/i.test(
    key,
  );

const isColorField = (key: string, value: string) =>
  /(color|colour)$/i.test(key) || /^#[\da-fA-F]{6}$/.test(value);

const isUrl = (value: string) => /^(https?:\/\/|\/)/i.test(value);

const isVideoValue = (key: string, value: string) =>
  /video/i.test(key) ||
  /\.(?:mp4|webm|ogg|mov|m4v)(?:[?#].*)?$/i.test(value) ||
  /pexels\.com\/video\//i.test(value) ||
  /pexels\.com\/download\/video\//i.test(value);

const isModelField = (path: (string | number)[]) =>
  ["modelUrl", "earthModelUrl"].includes(String(path[path.length - 1]));

const fieldPathKey = (path: (string | number)[]) => path.map(String).join(".");

const adminFieldLabel = (label: string, path: (string | number)[]) => {
  const key = fieldPathKey(path);
  if (key === "object.modelUrl") return "Signature jewellery model";
  if (key === "ctaSection.modelUrl") return "Private viewing jewellery model";
  if (key === "earthModelUrl") return "Earth 3D model (Space Explore)";
  return label === "model" ? "Built-in fallback model" : humanize(label);
};

const modelFieldHelp = (path: (string | number)[], value: string) => {
  const key = fieldPathKey(path);
  const directModelLink = /\.(?:glb|gltf|fbx)(?:[?#].*)?$/i.test(value.trim());
  const status = value.trim()
    ? directModelLink
      ? "The URL/file name looks like a direct model file. If the file is missing, blocked, or corrupt, the site will use its safe fallback."
      : "This does not look like a direct .glb, .gltf or .fbx file URL. Do not paste a Sketchfab/Drive/viewer page link; the safe fallback will be used until a valid model is set."
    : "No custom model set. The built-in model will be used.";

  if (key === "earthModelUrl") {
    return `Controls the 3D Earth in Space → Explore. Upload a model from your computer or paste a direct .glb URL (recommended), .gltf or .fbx URL. Blank or invalid files keep the existing textured Earth. Satellite / Orbiter is intentionally not editable here. ${status}`;
  }
  if (key === "ctaSection.modelUrl") {
    return `Controls the 3D jewellery object beside the Luxury private-viewing CTA. Upload a .glb file or paste a direct .glb/.gltf/.fbx file URL. Blank uses the built-in ring. Invalid files fall back safely without breaking the page. ${status}`;
  }
  return `Controls the 3D jewellery object in Luxury → Signature Object. Upload a .glb file or paste a direct .glb/.gltf/.fbx file URL. A local path such as /uploads/SESSION/ring.glb also works. Prefer self-contained .glb files; a .gltf needs its referenced .bin/textures to be reachable at the paths encoded in that file. Blank or invalid links use the built-in ring fallback instead of crashing the site. ${status}`;
};

const mediaFieldHelp = (key: string) => {
  if (/poster/i.test(key)) {
    return "Optional poster/fallback image shown while a video loads. Use a public image URL or upload an image file here.";
  }
  if (/video|media|image|background|asset/i.test(key)) {
    return "This field accepts either an image OR a video. Paste a public image URL, direct .mp4/.webm URL, or Pexels video page URL; you can also upload an image or video file. The site detects the media type automatically.";
  }
  return "Paste a public image URL or upload an image file.";
};

function AdminScrollIndicator() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf = 0;

    const update = () => {
      raf = 0;

      const max = Math.max(
        1,

        document.documentElement.scrollHeight - window.innerHeight,
      );

      setProgress(Math.max(0, Math.min(1, window.scrollY / max)));
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();

    window.addEventListener("scroll", onScroll, { passive: true });

    window.addEventListener("resize", onScroll);

    return () => {
      if (raf) cancelAnimationFrame(raf);

      window.removeEventListener("scroll", onScroll);

      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <aside className="admin-scroll-indicator" aria-hidden="true">
      <div className="admin-scroll-label">SCROLL / STUDIO</div>

      <div className="admin-scroll-track">
        <i
          className="admin-scroll-fill"
          style={{ height: `${progress * 100}%` }}
        />

        <b className="admin-scroll-orb" style={{ top: `${progress * 100}%` }} />

        <span className="admin-scroll-tick admin-scroll-tick-a" />

        <span className="admin-scroll-tick admin-scroll-tick-b" />

        <span className="admin-scroll-tick admin-scroll-tick-c" />
      </div>

      <div className="admin-scroll-percent">
        {String(Math.round(progress * 100)).padStart(3, "0")}
      </div>
    </aside>
  );
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function setAtPath<T>(root: T, path: (string | number)[], value: unknown): T {
  const next: any = clone(root);

  let cursor = next;

  path.forEach((segment, index) => {
    if (index === path.length - 1) cursor[segment as any] = value;
    else cursor = cursor[segment as any];
  });

  return next;
}

function MediaPreview({
  value,

  fieldKey,
}: {
  value: string;

  fieldKey: string;
}) {
  if (!value) return null;

  const src = resolveMediaSrc(value);

  const video = isVideoValue(fieldKey, value);

  return (
    <div className="studio-media-preview">
      <div className="studio-media-preview-head">
        <span>
          {video ? <Video size={12} /> : <ImageIcon size={12} />}{" "}
          {video ? "VIDEO PREVIEW" : "IMAGE PREVIEW"}
        </span>

        <code>{value}</code>
      </div>

      {video ? (
        <video src={src} controls muted playsInline preload="metadata" />
      ) : (
        <img src={src} alt="" loading="lazy" />
      )}
    </div>
  );
}

function Field({
  label,

  value,

  path,

  onChange,

  onUpload,
}: {
  label: string;

  value: any;

  path: (string | number)[];

  onChange: (path: (string | number)[], value: any) => void;

  onUpload: (path: (string | number)[], file: File) => void;
}) {
  const fieldKey = String(path[path.length - 1]);
  const fullPath = fieldPathKey(path);
  const modelField = isModelField(path);

  if (fullPath === "object.model")
    return (
      <div className="studio-field studio-model-readonly">
        <span>Built-in fallback model</span>
        <div className="studio-readonly-value"><Box size={14} /> Jewellery ring</div>
        <small className="studio-field-help">This is the automatic fallback if a custom model URL fails. To change the visible 3D asset, use the Signature jewellery model field below.</small>
      </div>
    );

  if (typeof value === "boolean")
    return (
      <label className="studio-field studio-toggle">
        <span>{label}</span>

        <button
          type="button"
          className={value ? "on" : ""}
          onClick={() => onChange(path, !value)}
        >
          <i /> {value ? "On" : "Off"}
        </button>
      </label>
    );

  if (typeof value === "number")
    return (
      <label className="studio-field">
        <span>{label}</span>

        <input
          className="studio-number"
          type="number"
          value={value}
          onChange={(e) => onChange(path, Number(e.target.value))}
          step="any"
        />
      </label>
    );

  if (typeof value === "string") {
    const mediaKey = [...path]

      .reverse()

      .find((segment) => typeof segment === "string") as string | undefined;

    const media =
      (mediaKey ? isMediaField(mediaKey) : false) ||
      isVideoValue(fieldKey, value) ||
      (isUrl(value) &&
        /\.(?:avif|webp|png|jpe?g|gif|svg|mp4|mov|webm|m4v)(?:$|[?#])/i.test(
          value,
        ));

    const color = isColorField(fieldKey, value);

    return (
      <label className={`studio-field ${media ? "studio-field-media" : ""} ${modelField ? "studio-field-model" : ""}`}>
        <span>{adminFieldLabel(label, path)}</span>

        <div className="studio-field-row">
          {color ? (
            <>
              <input
                className="studio-color"
                type="color"
                value={/^#[\da-fA-F]{6}$/.test(value) ? value : "#b9874f"}
                onChange={(e) => onChange(path, e.target.value)}
              />

              <input
                className="studio-input"
                value={value}
                onChange={(e) => onChange(path, e.target.value)}
              />
            </>
          ) : modelField ? (
            <input
              className="studio-input"
              value={value}
              onChange={(e) => onChange(path, e.target.value)}
              placeholder="/models/jewelry/ring.glb or https://.../ring.glb"
              spellCheck={false}
            />
          ) : isLongText(fieldKey, value) ? (
            <textarea
              className="studio-textarea"
              value={value}
              onChange={(e) => onChange(path, e.target.value)}
            />
          ) : (
            <input
              className="studio-input"
              value={value}
              onChange={(e) => onChange(path, e.target.value)}
            />
          )}

          {(media || modelField) && (
            <label className="studio-upload">
              {modelField ? <Box size={13} /> : <Upload size={13} />}

              <input
                type="file"
                accept={modelField
                  ? ".glb,.gltf,.fbx,model/gltf-binary,model/gltf+json,application/octet-stream"
                  : /video/i.test(String(mediaKey || ""))
                    ? "video/*"
                    : "image/*,video/*"}
                onChange={(e) =>
                  e.target.files?.[0] && onUpload(path, e.target.files[0])
                }
              />
            </label>
          )}
        </div>

        {modelField && <small className="studio-field-help">{modelFieldHelp(path, value)}</small>}
        {media && (
          <>
            <MediaPreview value={value} fieldKey={fieldKey} />
            <small className="studio-field-help">{mediaFieldHelp(fieldKey)}</small>
          </>
        )}
      </label>
    );
  }

  return null;
}

function ContentTree({
  value,

  path = [],

  label = "Content",

  onChange,

  onUpload,

  depth = 0,
}: {
  value: any;

  path?: (string | number)[];

  label?: string;

  onChange: (path: (string | number)[], value: any) => void;

  onUpload: (path: (string | number)[], file: File) => void;

  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 1);

  const primitiveArray =
    Array.isArray(value) &&
    value.every((item) =>
      ["string", "number", "boolean"].includes(typeof item),
    );

  if (value === null || value === undefined || typeof value !== "object")
    return (
      <Field
        label={humanize(label)}
        value={value ?? ""}
        path={path}
        onChange={onChange}
        onUpload={onUpload}
      />
    );

  if (primitiveArray)
    return (
      <section className="studio-array">
        <div className="studio-array-head">
          <span>{humanize(label)}</span>

          <button
            type="button"
            onClick={() =>
              onChange(path, [
                ...value,

                typeof value[0] === "number" ? 0 : "New item",
              ])
            }
          >
            + Add
          </button>
        </div>

        {value.map((item, index) => (
          <div key={`${String(item)}-${index}`} className="studio-array-item">
            <Field
              label={`${index + 1}`}
              value={item}
              path={[...path, index]}
              onChange={onChange}
              onUpload={onUpload}
            />

            <button
              type="button"
              className="icon-button danger"
              onClick={() =>
                onChange(
                  path,

                  value.filter((_: any, i: number) => i !== index),
                )
              }
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </section>
    );

  const entries = Object.entries(value);

  return (
    <section className={`studio-node ${depth > 0 ? "nested" : ""}`}>
      <button
        type="button"
        className="studio-node-head"
        onClick={() => setOpen((v) => !v)}
      >
        <span>
          <b>{depth === 0 ? "GROUP" : "DETAIL"}</b>

          {humanize(label)}
        </span>

        {open ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
      </button>

      {open && (
        <div className="studio-node-body">
          {entries.map(([key, child]) => (
            <ContentTree
              key={key}
              value={child}
              path={[...path, key]}
              label={key}
              onChange={onChange}
              onUpload={onUpload}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function HeroControls({
  kind,

  value,

  onChange,

  onUpload,
}: {
  kind: Kind;

  value: any;

  onChange: (path: (string | number)[], value: any) => void;

  onUpload: (path: (string | number)[], file: File) => void;
}) {
  const hero = value?.hero || {};

  const text = (path: (string | number)[], label: string, current: string) => (
    <label className="studio-field">
      <span>{label}</span>

      <input
        className="studio-input"
        value={current || ""}
        onChange={(e) => onChange(path, e.target.value)}
      />
    </label>
  );

  const media = (path: (string | number)[], label: string, current: string) => (
    <label className="studio-field studio-field-media">
      <span>{label}</span>

      <div className="studio-field-row">
        <input
          className="studio-input"
          value={current || ""}
          onChange={(e) => onChange(path, e.target.value)}
          placeholder="/media/file.mp4 or https://..."
        />

        <label className="studio-upload">
          <Upload size={13} />

          <input
            type="file"
            accept="video/*,image/*"
            onChange={(e) =>
              e.target.files?.[0] && onUpload(path, e.target.files[0])
            }
          />
        </label>
      </div>

      <MediaPreview
        value={current || ""}
        fieldKey={String(path[path.length - 1])}
      />
      <small className="studio-field-help">
        This media slot accepts an image or video. Paste a public image URL, a direct .mp4/.webm URL, or a Pexels video page URL; uploading an image/video file works too. The website detects the media type automatically.
      </small>
    </label>
  );

  return (
    <section
      className="studio-editor-section studio-editor-section-hero"
      id="studio-section-hero"
    >
      <div className="studio-section-heading">
        <div>
          <span>01 / HERO</span>

          <h2>
            {kind === "luxury"
              ? "The opening statement."
              : "The opening transmission."}
          </h2>

          <p>
            Keep the first screen focused. Edit only the content that actually
            appears here.
          </p>
        </div>

        <Sparkles size={18} />
      </div>

      <div className="studio-field-grid">
        {kind === "luxury" ? (
          <>
            {text(["hero", "eyebrow"], "Eyebrow", hero.eyebrow)}

            {text(["hero", "line1"], "Headline line 01", hero.line1)}

            {text(["hero", "line2"], "Headline line 02", hero.line2)}

            {text(["hero", "supporting"], "Supporting text", hero.supporting)}

            {media(["hero", "media"], "Hero media (image / video)", hero.media || hero.video || hero.poster)}

            {media(["hero", "poster"], "Video poster / fallback image", hero.poster)}

            {text(["hero", "scrollLabel"], "Scroll label", hero.scrollLabel)}
          </>
        ) : (
          <>
            {text(["hero", "eyebrow"], "Eyebrow", hero.eyebrow)}

            {text(["title"], "Hero title", value?.title)}

            {text(
              ["hero", "velocityLabel"],

              "Velocity label",

              hero.velocityLabel,
            )}

            {text(["hero", "cameraLink"], "Readout label", hero.cameraLink)}
          </>
        )}
      </div>
    </section>
  );
}

const sectionGroups = (kind: Kind): SectionGroup[] =>
  kind === "luxury"
    ? [
        {
          id: "identity",

          label: "Identity",

          keys: [
            "brand",

            "navLabel",

            "title",

            "subtitle",

            "cta",

            "modelColor",

            "animationSpeed",

            "visible",

            "cursorMode",

            "grain",

            "heroHeight",
          ],
        },

        { id: "navigation", label: "Navigation", keys: ["nav"] },

        { id: "story", label: "The House", keys: ["story"] },

        { id: "object", label: "Signature Object", keys: ["object"] },

        { id: "collection", label: "Collection", keys: ["collection"] },

        { id: "film", label: "Film / Light", keys: ["interlude"] },

        { id: "materials", label: "Material Studies", keys: ["reveal"] },

        { id: "process", label: "The Process", keys: ["chapters"] },

        { id: "numbers", label: "Numbers", keys: ["stats"] },

        { id: "cta", label: "Private Viewing", keys: ["ctaSection"] },

        { id: "footer", label: "Footer", keys: ["footer"] },

        { id: "pages", label: "Route Pages", keys: ["pages"] },
      ]
    : [
        {
          id: "identity",

          label: "Identity",

          keys: [
            "brand",

            "navLabel",

            "title",

            "subtitle",

            "cta",

            "modelColor",

            "animationSpeed",

            "visible",

            "cursorMode",

            "grain",

            "heroHeight",

            "earthModelUrl",
          ],
        },

        { id: "navigation", label: "Navigation", keys: ["nav"] },

        { id: "film", label: "Deep Field Film", keys: ["interlude"] },

        { id: "origin", label: "Origin", keys: ["journey"] },

        { id: "bodies", label: "Celestial Bodies", keys: ["planets"] },

        { id: "missions", label: "Mission Log", keys: ["missions"] },

        { id: "systems", label: "Instruments", keys: ["tech"] },

        { id: "motion", label: "Systems in Motion", keys: ["reveal"] },

        { id: "data", label: "Flight Data", keys: ["stats"] },

        { id: "timeline", label: "Timeline", keys: ["timeline"] },

        { id: "cta", label: "Final Transmission", keys: ["ctaSection"] },

        { id: "footer", label: "Footer", keys: ["footer"] },

        { id: "pages", label: "Route Pages", keys: ["pages"] },
      ];

function EditorGroup({
  group,

  index,

  draft,

  onChange,

  onUpload,

  defaultOpen,
}: {
  group: SectionGroup;

  index: number;

  draft: any;

  onChange: (path: (string | number)[], value: any) => void;

  onUpload: (path: (string | number)[], file: File) => void;

  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(Boolean(defaultOpen));

  return (
    <section
      id={`studio-section-${group.id}`}
      className={`studio-section-card ${open ? "open" : ""}`}
    >
      <button
        type="button"
        className="studio-section-card-head"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="studio-section-number">
          {String(index + 2).padStart(2, "0")}
        </span>

        <span className="studio-section-title">
          <b>{group.label}</b>

          <small>{group.keys.map((key) => humanize(key)).join(" · ")}</small>
        </span>

        {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>

      {open && (
        <div className="studio-section-card-body">
          {group.keys.map((key) => (
            <ContentTree
              key={key}
              value={draft?.[key]}
              path={[key]}
              label={key}
              onChange={onChange}
              onUpload={onUpload}
              depth={0}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function EditorMenu({ groups, tab }: { groups: SectionGroup[]; tab: Kind }) {
  const options = [
    { id: "hero", label: "01 / Hero" },
    ...groups.map((group, i) => ({
      id: group.id,
      label: `${String(i + 2).padStart(2, "0")} / ${group.label}`,
    })),
  ];

  const [selected, setSelected] = useState(options[0]?.id || "hero");

  useEffect(() => {
    setSelected("hero");
  }, [tab]);

  const jump = (id: string) => {
    setSelected(id);
    document
      .getElementById(`studio-section-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="studio-content-menu">
      <div className="studio-content-menu-copy">
        <span>CONTENT MAP</span>
        <strong>{tab === "luxury" ? "ATELIER / 09" : "NOVA / 01"}</strong>
      </div>
      <label className="studio-content-menu-select">
        <span>JUMP TO SECTION</span>
        <select value={selected} onChange={(event) => jump(event.target.value)}>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <div className="studio-content-menu-links" role="navigation" aria-label="Content sections">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            className={selected === option.id ? "active" : ""}
            onClick={() => jump(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<Kind>("luxury");

  const [panel, setPanel] = useState<Panel>("dashboard");

  const [draft, setDraft] = useState<any>(clone(defaultContent.luxury));

  const [saved, setSaved] = useState(false);

  const [syncing, setSyncing] = useState(false);

  const [toast, setToast] = useState("");

  const [assets, setAssets] = useState<Asset[]>([]);

  const [expandedMedia, setExpandedMedia] = useState(true);

  const [session, setSession] = useState("offline");

  const groups = sectionGroups(tab);

  useEffect(() => {
    const stored = window.localStorage.getItem("experience-session");

    if (stored) {
      setSession(stored.slice(0, 8));
    } else {
      const token = crypto.randomUUID();
      window.localStorage.setItem("experience-session", token);
      setSession(token.slice(0, 8));
    }
  }, []);

  async function syncFromApi(kind: Kind = tab) {
    setSyncing(true);

    try {
      const overrides = await getSessionOverrides<any>();

      setDraft(
        resolveContent((defaultContent as any)[kind], overrides?.[kind] || {}),
      );

      setToast("Live content synced.");
    } catch {
      setToast("Sync failed. Local content remains available.");
    } finally {
      setSyncing(false);

      window.setTimeout(() => setToast(""), 1500);
    }
  }

  useEffect(() => {
    syncFromApi(tab);
  }, [tab]);

  useEffect(() => {
    getMediaLibrary().then(setAssets);
  }, []);

  const update = (path: (string | number)[], value: any) =>
    setDraft((current: any) => setAtPath(current, path, value));

  const handleUpload = async (path: (string | number)[], file: File) => {
    try {
      const asset = await uploadMedia(file);

      setAssets((current) => [asset, ...current]);

      update(path, asset.url);

      setToast(`${file.name} uploaded and assigned.`);
    } catch (error: any) {
      setToast(error?.message || "Upload failed.");
    }

    window.setTimeout(() => setToast(""), 1800);
  };

  async function save() {
    const current = getOverrides<any>();

    const next = { ...current, [tab]: draft };

    const ok = await saveOverrides(next);

    setSaved(ok);

    setToast(
      ok ? "Published to this session." : "Saved locally. API publish failed.",
    );

    window.setTimeout(() => {
      setSaved(false);

      setToast("");
    }, 2200);
  }

  const reset = () => {
    setDraft(clone((defaultContent as any)[tab]));

    setToast("Seed content restored. Publish to use it.");

    window.setTimeout(() => setToast(""), 1600);
  };

  const panelTitle =
    panel === "dashboard"
      ? "Dashboard"
      : panel === "media"
        ? "Media library"
        : panel === "preview"
          ? "Live preview"
          : `${tab === "luxury" ? "Atelier" : "Nova"} / Content`;

  return (
    <main className="admin-page admin-studio-page">
      <AdminScrollIndicator />

      <aside className="admin-rail">
        <div className="admin-logo">
          <span>✳</span> / STUDIO
        </div>

        <div className="admin-rail-scroll">
          <div className="rail-intro">
            <span>CONTROL ROOM</span>

            <p>Two public experiences. One careful editor.</p>
          </div>

          <nav>
          <p>WORKSPACE</p>

          <button
            className={panel === "dashboard" ? "active" : ""}
            onClick={() => setPanel("dashboard")}
          >
            <b>01</b> Dashboard
          </button>

          <button
            className={panel === "editor" ? "active" : ""}
            onClick={() => setPanel("editor")}
          >
            <b>02</b> Content
          </button>

          <button
            className={panel === "media" ? "active" : ""}
            onClick={() => setPanel("media")}
          >
            <b>03</b> Media <small>{assets.length}</small>
          </button>

          <button
            className={panel === "preview" ? "active" : ""}
            onClick={() => setPanel("preview")}
          >
            <b>04</b> Preview
          </button>

          <p>SITES</p>

          <button
            className={tab === "luxury" ? "active" : ""}
            onClick={() => {
              setTab("luxury");

              setPanel("editor");
            }}
          >
            <b>01</b> Luxury / 01
          </button>

          <button
            className={tab === "space" ? "active" : ""}
            onClick={() => {
              setTab("space");

              setPanel("editor");
            }}
          >
            <b>02</b> Space / 02
          </button>
          </nav>

          <div className="rail-bottom">
            <span>SESSION</span>

            <strong>{session}</strong>

            <small>LOCAL + API</small>
          </div>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-header studio-header">
          <div>
            <span className="crumb">
              STUDIO / {tab.toUpperCase()} / {session}
            </span>

            <h1>
              {panelTitle}

              <Sparkles size={18} />
            </h1>

            <p>
              {panel === "editor"
                ? "Edit the exact fields used by the public site."
                : panel === "media"
                  ? "Review the visual assets before assigning them."
                  : panel === "preview"
                    ? "Check the public composition before publishing."
                    : "Keep the experience small, intentional and finished."}
            </p>
          </div>

          <div className="admin-actions">
            <button
              className="ghost-button"
              onClick={() => syncFromApi()}
              disabled={syncing}
            >
              <RefreshCw size={14} className={syncing ? "spin" : ""} /> Sync
            </button>

            <span className="saved-state">
              {saved ? (
                <>
                  <Check /> Published
                </>
              ) : (
                "Draft"
              )}
            </span>

            <button className="save-button" onClick={save}>
              <Save /> Publish
            </button>
          </div>
        </header>

        {panel === "dashboard" && (
          <div className="studio-dashboard">
            <div className="studio-dashboard-intro">
              <div>
                <span className="studio-overline">
                  {tab === "luxury" ? "ATELIER / 09" : "NOVA / 01"}
                </span>

                <h2>Make the site say exactly what it means.</h2>

                <p>
                  One place to adjust typography, imagery, video, sections and
                  route copy without digging through a wall of fields.
                </p>
              </div>

              <button
                className="studio-primary"
                onClick={() => setPanel("editor")}
              >
                Open content <span>↗</span>
              </button>
            </div>

            <div className="studio-site-cards">
              <article className="studio-site-card luxury">
                <div className="studio-card-mark">✦</div>

                <span>LUXURY / 01</span>

                <h3>Atelier 09</h3>

                <p>Objects, materials, craft and private viewing.</p>

                <button
                  onClick={() => {
                    setTab("luxury");

                    setPanel("editor");
                  }}
                >
                  Edit Luxury ↗
                </button>
              </article>

              <article className="studio-site-card space">
                <div className="studio-card-mark">◌</div>

                <span>SPACE / 02</span>

                <h3>NOVA / 01</h3>

                <p>Missions, spacecraft, archive and future studies.</p>

                <button
                  onClick={() => {
                    setTab("space");

                    setPanel("editor");
                  }}
                >
                  Edit Space ↗
                </button>
              </article>
            </div>

            <div className="studio-dashboard-metrics">
              <div>
                <span>SECTIONS</span>

                <strong>{groups.length}</strong>

                <small>structured editor groups</small>
              </div>

              <div>
                <span>MEDIA</span>

                <strong>{assets.length}</strong>

                <small>server assets</small>
              </div>

              <div>
                <span>DELIVERY</span>

                <strong>LIVE</strong>

                <small>API + local fallback</small>
              </div>
            </div>
          </div>
        )}

        {panel === "editor" && (
          <div className="studio-editor-shell">
            <div className="studio-editor-main">
              <EditorMenu groups={groups} tab={tab} />
              <div className="studio-toolbar">
                <div>
                  <span>CONTENT / {tab.toUpperCase()}</span>

                  <strong>
                    {tab === "luxury" ? "Atelier / 09" : "NOVA / 01"}
                  </strong>
                </div>

                <div>
                  <button onClick={reset}>Reset</button>

                  <button onClick={() => setPanel("preview")}>
                    <Eye size={14} /> Preview
                  </button>
                </div>
              </div>

              <HeroControls
                kind={tab}
                value={draft}
                onChange={update}
                onUpload={handleUpload}
              />

              <div className="studio-editor-list">
                {groups.map((group, index) => (
                  <EditorGroup
                    key={group.id}
                    group={group}
                    index={index}
                    draft={draft}
                    onChange={update}
                    onUpload={handleUpload}
                    defaultOpen={index === 0}
                  />
                ))}
              </div>
            </div>

          </div>
        )}

        {panel === "media" && (
          <div className="studio-media">
            <div className="media-hero">
              <div>
                <span>MEDIA VAULT</span>

                <h2>See the assets before they ship.</h2>

                <p>
                  Upload images, videos and 3D models, then copy or use the URL in the matching content field. Image/media fields accept image files, video files and Pexels video-page URLs. Model fields accept .glb, .gltf or .fbx files/URLs; prefer self-contained .glb. Upload limits: images 15 MB; videos and 3D models 80 MB. Invalid model links fall back safely instead of breaking the page.
                </p>
              </div>

              <label className="studio-primary upload-hero-button">
                <Upload size={16} /> Upload asset
                <input
                  type="file"
                  accept="image/*,video/*,.glb,.gltf,.fbx,model/gltf-binary,model/gltf+json,application/octet-stream"
                  onChange={async (e) => {
                    if (!e.target.files?.[0]) return;

                    try {
                      const asset = await uploadMedia(e.target.files[0]);

                      setAssets((current) => [asset, ...current]);

                      setToast(`${asset.name} is ready.`);
                    } catch (error: any) {
                      setToast(error?.message || "Upload failed.");
                    }

                    window.setTimeout(() => setToast(""), 1600);
                  }}
                />
              </label>
            </div>

            <div className="media-section-head">
              <button onClick={() => setExpandedMedia((v) => !v)}>
                {expandedMedia ? (
                  <ChevronDown size={16} />
                ) : (
                  <ChevronRight size={16} />
                )}{" "}
                {assets.length} assets
              </button>

              <span>SESSION / {session}</span>
            </div>

            {expandedMedia && (
              <div className="asset-wall studio-asset-wall">
                {assets.length ? (
                  assets.map((asset) => (
                    <article key={`${asset.url}-${asset.name}`}>
                      <div className="asset-preview">
                        {asset.type === "model" ? (
                          <div className="studio-model-asset-preview">
                            <Box size={28} />
                            <strong>3D MODEL</strong>
                            <small>Copy this URL into a model field.</small>
                          </div>
                        ) : asset.type.startsWith("video") ? (
                          <video
                            src={asset.url}
                            muted
                            loop
                            autoPlay
                            playsInline
                            controls
                          />
                        ) : (
                          <img src={asset.url} alt={asset.name} />
                        )}
                      </div>

                      <div className="asset-meta">
                        <strong>{asset.name}</strong>

                        <small>
                          {asset.type} ·{" "}
                          {asset.size
                            ? `${Math.round(asset.size / 1024)} KB`
                            : "server asset"}
                        </small>
                      </div>

                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(asset.url);

                          setToast("Asset URL copied.");

                          window.setTimeout(() => setToast(""), 1000);
                        }}
                      >
                        Copy URL
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="empty-assets">
                    No uploads yet. Public-site defaults remain available.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {panel === "preview" && (
          <div className="full-preview-panel">
            <div className="preview-browser-bar">
              <span>LIVE SITE / {tab.toUpperCase()}</span>

              <div>
                <a
                  href={tab === "luxury" ? "/luxury" : "/space"}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open public site ↗
                </a>

                <button onClick={() => setPanel("editor")}>
                  Back to editor
                </button>
              </div>
            </div>

            <div className={`preview-viewport preview-${tab}`}>
              {tab === "luxury" ? (
                <LuxuryPreview content={draft} />
              ) : (
                <SpacePreview content={draft} />
              )}
            </div>
          </div>
        )}
      </section>

      {toast && (
        <div className="admin-toast">
          <span>{toast}</span>

          <button onClick={() => setToast("")}>Dismiss</button>
        </div>
      )}
    </main>
  );
}

function LuxuryPreview({ content }: { content: any }) {
  return (
    <div className="content-preview-mock">
      <div
        className="preview-backdrop"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(10,8,6,.86),rgba(10,8,6,.18)),url(${resolveMediaSrc(content.heroImage)})`,
        }}
      />

      <div className="preview-nav">
        <strong>{content.brand}</strong>

        <span>{content.navLabel}</span>
      </div>

      <div className="preview-hero-copy">
        <span>{content.meta?.eyebrow}</span>

        <h2>{content.title}</h2>

        <p>{content.subtitle}</p>

        <button>{content.cta}</button>
      </div>

      <div className="preview-blocks">
        <article>
          <span>{content.story?.eyebrow}</span>

          <h3>
            {content.story?.titleLead} <em>{content.story?.titleEmphasis}</em>{" "}
            {content.story?.titleTail}
          </h3>

          <p>{content.story?.lede}</p>
        </article>

        <article>
          <span>{content.object?.eyebrow}</span>

          <h3>{content.object?.title}</h3>

          <p>{content.object?.description}</p>
        </article>

        <article>
          <span>COLLECTION</span>

          <h3>
            {content.collection?.titleLine1}{" "}
            <em>{content.collection?.titleEmphasis}</em>
          </h3>

          <p>{content.collection?.copy}</p>
        </article>
      </div>
    </div>
  );
}

function SpacePreview({ content }: { content: any }) {
  return (
    <div className="content-preview-mock space-preview-mock">
      <div
        className="preview-backdrop"
        style={{
          backgroundImage: `linear-gradient(90deg,rgba(2,6,18,.9),rgba(2,6,18,.14)),url(${resolveMediaSrc(content.heroImage)})`,
        }}
      />

      <div className="preview-nav">
        <strong>{content.brand}</strong>

        <span>{content.navLabel}</span>
      </div>

      <div className="preview-hero-copy">
        <span>{content.hero?.eyebrow}</span>

        <h2>{content.title}</h2>

        <p>{content.subtitle}</p>

        <button>{content.cta}</button>
      </div>

      <div className="preview-blocks">
        <article>
          <span>{content.journey?.label}</span>

          <h3>
            {content.journey?.titleLead}{" "}
            <em>{content.journey?.titleEmphasis}</em>{" "}
            {content.journey?.titleTail}
          </h3>

          <p>{content.journey?.copy}</p>
        </article>

        <article>
          <span>{content.missions?.label}</span>

          <h3>{content.missions?.title}</h3>

          <p>
            {content.missions?.items?.map((item: any) => item.name).join(" · ")}
          </p>
        </article>

        <article>
          <span>{content.timeline?.label}</span>

          <h3>{content.timeline?.title}</h3>

          <p>
            {content.timeline?.items?.map((item: any) => item[0]).join(" → ")}
          </p>
        </article>
      </div>
    </div>
  );
}
