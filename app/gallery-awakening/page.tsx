'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { mockMediaItems } from './mockMedia';
import { mockSyncState } from './mockSyncState';
import type { MediaItem } from './mediaTypes';
import { MediaGrid } from './components/MediaGrid';
import { getAutoBoxResult } from './featureLogic';
import { FeatureHero } from './components/FeatureHero';
import { SyncCenter } from './components/SyncCenter';
import { useGalleryData } from './useGalleryData';
import { FilterBar, SortMode } from './components/FilterBar';
import { MemoryPulse } from './components/MemoryPulse';
import { VersionLog } from './components/VersionLog';

function applyTagFilter(items: MediaItem[], activeTags: string[]): MediaItem[] {
  if (!activeTags.length) return items;
  return items.filter((item) => activeTags.every((tag) => item.tags?.includes(tag)));
}

function applySort(items: MediaItem[], mode: SortMode): MediaItem[] {
  const copy = [...items];
  switch (mode) {
    case 'most_viewed':
      return copy.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    case 'most_loved':
      return copy.sort((a, b) => {
        const favWeightA = a.isFavorite ? 1 : 0;
        const favWeightB = b.isFavorite ? 1 : 0;
        if (favWeightB !== favWeightA) return favWeightB - favWeightA;
        return (b.viewCount ?? 0) - (a.viewCount ?? 0);
      });
    case 'recent':
    default:
      return copy.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }
}

function uniqueTags(items: MediaItem[]): string[] {
  const set = new Set<string>();
  for (const item of items) {
    for (const tag of item.tags ?? []) {
      set.add(tag);
    }
  }
  return Array.from(set).sort();
}

function sourceLabel(source: string): string {
  switch (source) {
    case 'r2':
      return 'Cloudflare R2 + local';
    case 'cache':
      return 'Local cache';
    default:
      return 'Mock data';
  }
}

const GalleryAwakeningPage: React.FC = () => {
  const { items, isLoading, source, lastUpdated, error } = useGalleryData(mockMediaItems);
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [sortMode, setSortMode] = useState<SortMode>('recent');
  const [imagePage, setImagePage] = useState(1);
  const [videoPage, setVideoPage] = useState(1);

  const PAGE_SIZE = 20;

  const availableTags = useMemo(() => uniqueTags(items), [items]);
  const totalItems = items.length;
  const imagesCount = items.filter((i) => i.type === 'image').length;
  const videosCount = items.filter((i) => i.type === 'video').length;
  const favoritesCount = items.filter((i) => i.isFavorite).length;

  const filteredAndSorted = useMemo(() => {
    const byTag = applyTagFilter(items, activeTags);
    return applySort(byTag, sortMode);
  }, [items, activeTags, sortMode]);

  const filteredImages = useMemo(
    () => filteredAndSorted.filter((i) => i.type === 'image'),
    [filteredAndSorted]
  );
  const filteredVideos = useMemo(
    () => filteredAndSorted.filter((i) => i.type === 'video'),
    [filteredAndSorted]
  );

  useEffect(() => {
    setImagePage(1);
    setVideoPage(1);
  }, [activeTags, sortMode, items]);

  const autoBox = getAutoBoxResult(items);

  const handleToggleTag = (tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  return (
    <main className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 pb-12 pt-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-gradient-to-br from-emerald-600/20 via-sky-500/10 to-transparent blur-3xl" />

      <header className="rounded-3xl border border-emerald-900/40 bg-zinc-950/80 p-6 shadow-lg shadow-emerald-900/20 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-300">
            GAIA Awakening v3.3
          </p>
          <span className="rounded-full border border-emerald-800/60 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200">
            {sourceLabel(source)}
          </span>
          {lastUpdated && (
            <span className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-[11px] text-zinc-300">
              Updated {new Date(lastUpdated).toLocaleString()}
            </span>
          )}
        </div>
        <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-3xl font-bold text-zinc-50">
            Gallery Awakening <span className="text-emerald-300">Memory Vault</span>
          </h1>
          {error && (
            <p className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] text-amber-200">
              Gallery load issue: {error}. Using cached/mock data instead.
            </p>
          )}
        </div>
        <p className="mt-2 max-w-3xl text-sm text-zinc-400">
          A cleaner, more modern vault for photos and videos: fresh hero, stacked stats, glass panels,
          and faster filters that feel like a real gallery app.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total items', value: totalItems },
            { label: 'Images', value: imagesCount },
            { label: 'Videos', value: videosCount },
            { label: 'Favorites', value: favoritesCount },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-zinc-800/70 bg-zinc-900/70 px-4 py-3 shadow-sm shadow-emerald-900/10"
            >
              <p className="text-[11px] uppercase tracking-[0.12em] text-zinc-500">{stat.label}</p>
              <p className="text-2xl font-semibold text-emerald-200">{stat.value}</p>
            </div>
          ))}
        </div>
      </header>

      <section className="space-y-4 rounded-3xl border border-zinc-900/60 bg-zinc-950/70 p-5 shadow-md shadow-emerald-900/20 backdrop-blur">
        <FeatureHero autoBox={autoBox} />
        <FilterBar
          availableTags={availableTags}
          activeTags={activeTags}
          onToggleTag={handleToggleTag}
          sortMode={sortMode}
          onChangeSort={setSortMode}
          sourceLabel={sourceLabel(source)}
          lastUpdated={lastUpdated}
          isLoading={isLoading}
        />
        <div className="grid gap-4 lg:grid-cols-2">
          <MemoryPulse items={items} />
          <SyncCenter state={mockSyncState} />
        </div>
      </section>

      <section className="space-y-10">
        <MediaGrid
          title="Images"
          items={filteredImages}
          typeFilter="image"
          perPage={PAGE_SIZE}
          page={imagePage}
          onPageChange={setImagePage}
        />
        <MediaGrid
          title="Videos"
          items={filteredVideos}
          typeFilter="video"
          perPage={PAGE_SIZE}
          page={videoPage}
          onPageChange={setVideoPage}
        />
      </section>

      <footer className="mt-4 space-y-4 rounded-3xl border border-zinc-900/60 bg-zinc-950/70 p-4 shadow-inner shadow-black/20">
        <VersionLog />
      </footer>
    </main>
  );
};

export default GalleryAwakeningPage;
