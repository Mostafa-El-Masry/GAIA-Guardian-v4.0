"use client";

import { readJSON } from "@/lib/user-storage";

export type BuildEntry = {
  conceptId: string;
  nodeId: string;
  trackId: string;
  trackTitle: string;
  title: string;
  note: string;
  embedUrl?: string;
  score?: number;
  total?: number;
  completedAt?: number;
};

type StoredResult = {
  nodeId?: string;
  trackId?: string;
  trackTitle?: string;
  title?: string;
  score?: number;
  total?: number;
  completedAt?: number;
};

type StoredBuild = {
  note?: string;
  embedUrl?: string;
  title?: string;
  trackId?: string;
  trackTitle?: string;
  nodeId?: string;
};

/**
  Read stored academy build results and merge them with any saved build metadata.
  This no longer depends on a separate concepts dataset, so Labs works even when
  that file is missing in local clones.
*/
function listAcademyBuilds(): BuildEntry[] {
  const results = readJSON<Record<string, StoredResult>>("gaia.academy.results", {});
  const builds = readJSON<Record<string, StoredBuild>>("gaia.academy.builds", {});

  const ids = Array.from(new Set([...Object.keys(results), ...Object.keys(builds)]));

  return ids
    .map((id) => {
      const r = results[id] ?? {};
      const b = builds[id] ?? {};

      const hasScore = typeof r.score === "number" && typeof r.total === "number";
      const hasContent = hasScore || Boolean(b.note) || Boolean(b.embedUrl);
      if (!hasContent) return null;

      return {
        conceptId: id,
        nodeId: r.nodeId ?? b.nodeId ?? id,
        trackId: r.trackId ?? b.trackId ?? "academy",
        trackTitle: r.trackTitle ?? b.trackTitle ?? "Academy",
        title: r.title ?? b.title ?? `Concept ${id}`,
        note: b.note ?? "",
        embedUrl: b.embedUrl,
        score: hasScore ? r.score : undefined,
        total: hasScore ? r.total : undefined,
        completedAt: r.completedAt,
      } as BuildEntry;
    })
    .filter((b): b is BuildEntry => Boolean(b));
}

/**
 * Static demo builds that show up only when you have not completed any Academy builds yet.
 * They give Labs a useful baseline without polluting your real data.
 */
const demoBuilds: BuildEntry[] = [
  {
    conceptId: "demo-inventory-system",
    nodeId: "demo-node-inventory",
    trackId: "systems",
    trackTitle: "Systems",
    title: "Inventory Management Lab",
    note:
      "First sketch of a personal inventory system: 8 locations, 8 POS terminals, and a simple dashboard.\n" +
      "This is a demo entry so Labs never feels empty - your real builds will replace this once you pass Academy concepts.",
    embedUrl: "/apollo/labs/inventory",
    score: 100,
    total: 100,
    completedAt: Date.now(),
  },
  {
    conceptId: "demo-html-layout",
    nodeId: "demo-node-html-layout",
    trackId: "html",
    trackTitle: "HTML",
    title: "HTML Static Layout Prototype",
    note:
      "A small static layout that only uses semantic HTML: header/nav/main/section/footer.\n" +
      "The goal is to prove to yourself that you can ship something clean without any JavaScript.",
    embedUrl: "/Archives/html",
    score: 100,
    total: 100,
    completedAt: Date.now(),
  },
];

export function listBuilds(): BuildEntry[] {
  const academyBuilds = listAcademyBuilds();

  if (academyBuilds.length === 0) {
    // No completed concepts yet - show static demos so the UI has something to work with.
    return demoBuilds;
  }

  return academyBuilds;
}
