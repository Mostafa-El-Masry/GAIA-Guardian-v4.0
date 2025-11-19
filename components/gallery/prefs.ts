export type AutoTagMeta = {
  version: string;
  tags: string[];
  updatedAt?: string;
};

type TagMap = Record<string, string[]>;
type AutoMetaMap = Record<string, AutoTagMeta>;

const TAGS_KEY = "gaia_gallery_tags_v1";
const AUTO_META_KEY = "gaia_gallery_auto_meta_v1";
const VIEW_KEYS = [
  "gaia_gallery_views_v1",
  "gaia_gallery_previews_v1",
  "gaia_gallery_feature_history_v1",
];

function safeParse<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage quota errors
  }
}

export function resetViews() {
  if (typeof window === "undefined") return;
  VIEW_KEYS.forEach((key) => {
    window.localStorage.removeItem(key);
  });
  window.dispatchEvent(new Event("gallery:refresh"));
  window.dispatchEvent(new Event("storage"));
}

export function getTagsMap(): TagMap {
  return safeParse<TagMap>(TAGS_KEY, {});
}

export function mergeItemTags(id: string, tags: string[]): string[] {
  const map = getTagsMap();
  const next = Array.from(new Set([...(map[id] ?? []), ...tags.filter(Boolean)]));
  map[id] = next;
  safeWrite(TAGS_KEY, map);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("gallery:tags-updated", { detail: { tagMap: map } }));
    window.dispatchEvent(new Event("storage"));
  }

  return next;
}

export function getAutoTagMeta(): AutoMetaMap {
  return safeParse<AutoMetaMap>(AUTO_META_KEY, {});
}

export function setAutoTagMeta(id: string, meta: AutoTagMeta) {
  const all = getAutoTagMeta();
  all[id] = meta;
  safeWrite(AUTO_META_KEY, all);
}
