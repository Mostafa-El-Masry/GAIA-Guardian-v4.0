'use client';

import React, { useMemo } from 'react';
import type { MediaItem, MediaType } from '../mediaTypes';
import { MediaCard } from './MediaCard';

interface MediaGridProps {
  title: string;
  items: MediaItem[];
  typeFilter: MediaType;
  page?: number;
  perPage?: number;
  onPageChange?: (page: number) => void;
}

export const MediaGrid: React.FC<MediaGridProps> = ({
  title,
  items,
  typeFilter,
  page,
  perPage,
  onPageChange,
}) => {
  const filtered = useMemo(
    () => items.filter((item) => item.type === typeFilter),
    [items, typeFilter]
  );

  if (filtered.length === 0) {
    return null;
  }

  const totalPages =
    perPage && perPage > 0 ? Math.max(1, Math.ceil(filtered.length / perPage)) : 1;
  const currentPage = perPage && perPage > 0 ? Math.min(page ?? 1, totalPages) : 1;
  const start = perPage && perPage > 0 ? (currentPage - 1) * perPage : 0;
  const end = perPage && perPage > 0 ? start + perPage : filtered.length;
  const paged = filtered.slice(start, end);

  return (
    <section className="space-y-4 rounded-3xl border border-zinc-900/60 bg-zinc-950/60 p-4 shadow-inner shadow-black/20">
      <header className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-zinc-50">{title}</h2>
        <p className="text-xs text-zinc-500">
          {filtered.length} {typeFilter === 'image' ? 'images' : 'videos'}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {paged.map((item) => (
          <MediaCard key={item.id} item={item} />
        ))}
      </div>

      {totalPages > 1 && onPageChange && perPage && (
        <div className="flex items-center justify-between gap-3 text-xs text-zinc-400">
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-[11px] transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-[11px] transition hover:border-zinc-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
