'use client';

import React, { useMemo } from 'react';
import type { MediaItem } from '../mediaTypes';

interface MemoryPulseProps {
  items: MediaItem[];
}

function countByPredicate(items: MediaItem[], predicate: (item: MediaItem) => boolean): number {
  return items.reduce((acc, item) => (predicate(item) ? acc + 1 : acc), 0);
}

export const MemoryPulse: React.FC<MemoryPulseProps> = ({ items }) => {
  const now = new Date();

  const summary = useMemo(() => {
    if (!items.length) {
      return {
        total: 0,
        thisMonth: 0,
        thisYear: 0,
        nostalgiaWeek: 0,
        powerTagged: 0,
        favorites: 0
      };
    }

    const total = items.length;
    const thisYear = countByPredicate(items, (item) => {
      const d = new Date(item.createdAt);
      return d.getFullYear() === now.getFullYear();
    });
    const thisMonth = countByPredicate(items, (item) => {
      const d = new Date(item.createdAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });

    const nostalgiaWeek = countByPredicate(items, (item) => {
      const d = new Date(item.createdAt);
      // Same week (±3 days) in any year
      const oneDayMs = 24 * 60 * 60 * 1000;
      const diffDays = Math.abs(
        Math.round(
          (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
            Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())) / oneDayMs
        )
      );
      return diffDays <= 3;
    });

    const powerTagged = countByPredicate(items, (item) => item.tags?.includes('power') ?? false);
    const favorites = countByPredicate(items, (item) => !!item.isFavorite);

    return {
      total,
      thisMonth,
      thisYear,
      nostalgiaWeek,
      powerTagged,
      favorites
    };
  }, [items, now]);

  return (
    <section className="space-y-3 rounded-3xl border border-emerald-900/60 bg-gradient-to-br from-zinc-950 via-zinc-950/90 to-emerald-950/30 p-4 text-xs text-zinc-200 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Memory Pulse
          </p>
          <p className="text-xs text-zinc-300">
            A quick heartbeat from your Gallery, ready to link with the Daily Thread later.
          </p>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-200">
          {summary.total} memories
        </span>
      </header>

      {summary.total === 0 ? (
        <p className="text-[11px] text-zinc-400">
          Once you add images and videos, GAIA will start summarising what kind of memories you are
          collecting this month and across your timeline.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1 rounded-2xl bg-zinc-950/70 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              This Month
            </p>
            <p className="text-base font-semibold text-emerald-200">{summary.thisMonth}</p>
            <p className="text-[11px] text-zinc-400">
              Memories captured in this calendar month of any year.
            </p>
          </div>
          <div className="space-y-1 rounded-2xl bg-zinc-950/70 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              This Year
            </p>
            <p className="text-base font-semibold text-emerald-200">{summary.thisYear}</p>
            <p className="text-[11px] text-zinc-400">
              New additions in the current year. Future Daily Thread can sync with this.
            </p>
          </div>
          <div className="space-y-1 rounded-2xl bg-zinc-950/70 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Nostalgia Week
            </p>
            <p className="text-base font-semibold text-emerald-200">{summary.nostalgiaWeek}</p>
            <p className="text-[11px] text-zinc-400">
              Memories from this week across years – perfect for &ldquo;from this week then&rdquo;
              prompts in the Daily Thread.
            </p>
          </div>
          <div className="space-y-1 rounded-2xl bg-zinc-950/70 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Power Tagged
            </p>
            <p className="text-base font-semibold text-emerald-200">{summary.powerTagged}</p>
            <p className="text-[11px] text-zinc-400">
              Images or videos tagged as <span className="font-semibold text-emerald-300">power</span>.
            </p>
          </div>
          <div className="space-y-1 rounded-2xl bg-zinc-950/70 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
              Favorites
            </p>
            <p className="text-base font-semibold text-emerald-200">{summary.favorites}</p>
            <p className="text-[11px] text-zinc-400">
              Memories you explicitly marked as favorites – good candidates for Daily Thread anchors.
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
