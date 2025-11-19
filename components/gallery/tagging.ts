import type { GalleryItem } from "./types";

export const AUTO_TAG_VERSION = "1.0.0";

export type AutoTagResult = {
  id: string;
  tags: string[];
  matchedKeywords: string[];
};

const KEYWORD_GROUPS: Array<{ tag: string; keywords: string[] }> = [
  { tag: "travel", keywords: ["trip", "travel", "vacation", "journey"] },
  { tag: "family", keywords: ["family", "kids", "mom", "dad", "sister", "brother"] },
  { tag: "work", keywords: ["work", "office", "project", "client"] },
  { tag: "nature", keywords: ["mountain", "forest", "lake", "sunset", "sunrise"] },
  { tag: "city", keywords: ["city", "urban", "street"] },
  { tag: "event", keywords: ["party", "wedding", "birthday", "festival"] },
];

const normalize = (value?: string) => value?.toLowerCase() ?? "";

export function deriveAutoTags(item: GalleryItem): AutoTagResult {
  const tags = new Set<string>();
  const matchedKeywords: string[] = [];

  const haystack = normalize(
    [
      item.title,
      item.description,
      item.slug,
      item.r2Path,
      item.localPath,
      (item.tags ?? []).join(" "),
    ].join(" ")
  );

  KEYWORD_GROUPS.forEach(({ tag, keywords }) => {
    if (keywords.some((kw) => haystack.includes(kw))) {
      tags.add(tag);
      matchedKeywords.push(tag);
    }
  });

  if (item.type === "video") tags.add("video");
  if (item.type === "image") tags.add("image");

  (item.tags ?? []).forEach((tag) => {
    if (tag) tags.add(tag);
  });

  return {
    id: item.id,
    tags: Array.from(tags),
    matchedKeywords,
  };
}
