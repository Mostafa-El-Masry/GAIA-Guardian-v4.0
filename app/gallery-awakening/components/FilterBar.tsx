'use client';

import React from 'react';

export type SortMode = 'recent' | 'most_viewed' | 'most_loved';

interface FilterBarProps {
  availableTags: string[];
  activeTags: string[];
  onToggleTag: (tag: string) => void;
  sortMode: SortMode;
  onChangeSort: (mode: SortMode) => void;
  sourceLabel: string;
  lastUpdated: string | null;
  isLoading: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  availableTags,
  activeTags,
  onToggleTag,
  sortMode,
  onChangeSort,
  sourceLabel,
  lastUpdated,
  isLoading
}) => {
  const sorts: { id: SortMode; label: string }[] = [
    { id: 'recent',       label: 'Recently added' },
    { id: 'most_viewed',  label: 'Most viewed' },
    { id: 'most_loved',   label: 'Most loved' }
  ];

  const lastUpdatedLabel =
    lastUpdated != null ? new Date(lastUpdated).toLocaleString() : 'not yet synced';

  return (
    <section className="space-y-3 rounded-3xl border border-zinc-800 bg-gradient-to-r from-zinc-950/90 via-zinc-950/80 to-emerald-950/10 p-4 text-xs text-zinc-300 shadow-inner shadow-black/30">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">Sort</span>
          <div className="inline-flex overflow-hidden rounded-full border border-zinc-800 bg-zinc-900/70">
            {sorts.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onChangeSort(s.id)}
                className={`px-3 py-1 text-[11px] font-medium transition ${
                  sortMode === s.id
                    ? 'bg-emerald-500/15 text-emerald-200'
                    : 'text-zinc-300 hover:bg-zinc-800/80'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
          <span className="rounded-full border border-zinc-800 bg-zinc-900/90 px-2 py-0.5">
            Source: <span className="font-medium text-zinc-200">{sourceLabel}</span>
          </span>
          <span className="rounded-full border border-zinc-800 bg-zinc-900/90 px-2 py-0.5">
            Last updated: <span className="font-medium text-zinc-200">{lastUpdatedLabel}</span>
          </span>
          {isLoading && (
            <span className="rounded-full border border-emerald-800/60 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
              Loading...
            </span>
          )}
        </div>
      </div>

      {availableTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-zinc-500">
            <span>Tags</span>
            {activeTags.length > 0 && (
              <span className="rounded-full border border-emerald-800/60 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-200">
                {activeTags.length} selected
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {availableTags.map((tag) => {
              const active = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggleTag(tag)}
                  className={`rounded-full px-2 py-0.5 text-[11px] transition ${
                    active
                      ? 'border border-emerald-500/80 bg-emerald-500/20 text-emerald-100 shadow-sm shadow-emerald-900/40'
                      : 'border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:border-zinc-600'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
