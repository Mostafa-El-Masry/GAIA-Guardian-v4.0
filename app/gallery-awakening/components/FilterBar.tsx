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
    <section className="space-y-3 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-300">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
            View Mode
          </span>
          <div className="inline-flex overflow-hidden rounded-full border border-zinc-800 bg-zinc-900/70">
            {sorts.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onChangeSort(s.id)}
                className={`px-3 py-1 text-[11px] font-medium ${
                  sortMode === s.id
                    ? 'bg-emerald-500/10 text-emerald-300'
                    : 'text-zinc-300 hover:bg-zinc-800/80'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
          <span className="rounded-full bg-zinc-900/90 px-2 py-0.5">
            Source: <span className="font-medium text-zinc-200">{sourceLabel}</span>
          </span>
          <span className="rounded-full bg-zinc-900/90 px-2 py-0.5">
            Last updated: <span className="font-medium text-zinc-200">{lastUpdatedLabel}</span>
          </span>
          {isLoading && (
            <span className="rounded-full bg-zinc-900/90 px-2 py-0.5 text-[10px] text-emerald-300">
              Loading...
            </span>
          )}
        </div>
      </div>

      {availableTags.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-[0.16em] text-zinc-500">
            Tags
          </p>
          <div className="flex flex-wrap gap-1">
            {availableTags.map((tag) => {
              const active = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onToggleTag(tag)}
                  className={`rounded-full px-2 py-0.5 text-[11px] ${
                    active
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/80'
                      : 'bg-zinc-900/80 text-zinc-300 border border-zinc-800 hover:border-zinc-600'
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
