'use client';

import React, { useMemo, useState } from 'react';
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

  const availableTags = useMemo(() => uniqueTags(items), [items]);

  const filteredAndSorted = useMemo(() => {
    const byTag = applyTagFilter(items, activeTags);
    return applySort(byTag, sortMode);
  }, [items, activeTags, sortMode]);

  const autoBox = getAutoBoxResult(items);

  const handleToggleTag = (tag: string) => {
    setActiveTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-4 pb-10 pt-8">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
          GAIA Awakening v3.3
        </p>
        <h1 className="text-2xl font-bold text-zinc-50">
          Gallery Awakening <span className="text-emerald-300">Memory Vault</span>
        </h1>
        <p className="max-w-2xl text-sm text-zinc-400">
          Polish + Navigation: the Gallery now pulls Cloudflare R2 images and previews, keeps videos
          local, and layers on filters, Memory Pulse, Sync Center, and a small version log so GAIA
          remembers what this level unlocked.
        </p>
        {error && (
          <p className="text-[11px] text-amber-300">
            Gallery load issue: {error}. Using cached/mock data instead.
          </p>
        )}
      </header>

      <section className="space-y-4">
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
        <MemoryPulse items={items} />
        <SyncCenter state={mockSyncState} />
      </section>

      <section className="space-y-10">
        <MediaGrid title="Images" items={filteredAndSorted} typeFilter="image" />
        <MediaGrid title="Videos" items={filteredAndSorted} typeFilter="video" />
      </section>

      <footer className="mt-4 space-y-4 border-t border-zinc-800 pt-4">
        <VersionLog />
      </footer>
    </main>
  );
};

export default GalleryAwakeningPage;
