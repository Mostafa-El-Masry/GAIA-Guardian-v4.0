'use client';

import React, { useMemo } from 'react';
import type { MediaItem, MediaType } from '../mediaTypes';
import { MediaCard } from './MediaCard';

interface MediaGridProps {
  title: string;
  items: MediaItem[];
  typeFilter: MediaType;
}

export const MediaGrid: React.FC<MediaGridProps> = ({ title, items, typeFilter }) => {
  const filtered = useMemo(
    () => items.filter((item) => item.type === typeFilter),
    [items, typeFilter]
  );

  if (filtered.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-zinc-50">{title}</h2>
        <p className="text-xs text-zinc-500">
          {filtered.length} {typeFilter === 'image' ? 'images' : 'videos'}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {filtered.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};
