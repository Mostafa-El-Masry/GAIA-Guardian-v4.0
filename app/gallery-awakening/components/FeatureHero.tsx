'use client';

import React from 'react';
import type { AutoBoxResult } from '../featureLogic';
import { MediaCard } from './MediaCard';

interface FeatureHeroProps {
  autoBox: AutoBoxResult;
}

export const FeatureHero: React.FC<FeatureHeroProps> = ({ autoBox }) => {
  if (!autoBox.item) {
    return (
      <section className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-500">
        <p className="font-medium">No Feature Yet</p>
        <p className="mt-1 text-xs">
          Add some memories to your Gallery and GAIA will start picking a Feature of the Month here.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-emerald-900/60 bg-gradient-to-br from-emerald-600/15 via-zinc-950/90 to-emerald-900/25 p-5 shadow-lg shadow-emerald-900/20">
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex-1 space-y-2">
          <p className="inline-flex items-center gap-2 rounded-full border border-emerald-700/60 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
            {autoBox.label}
          </p>
          <h2 className="text-xl font-semibold text-zinc-50">
            Feature of the Month - <span className="text-emerald-300">{autoBox.item.title}</span>
          </h2>
          <p className="text-xs text-zinc-400 max-w-xl">{autoBox.description}</p>
          {autoBox.item.description && (
            <p className="text-xs text-emerald-100/90 max-w-xl">"{autoBox.item.description}"</p>
          )}
        </div>
        <div className="flex-1 md:max-w-sm">
          {/* Reuse the same card visuals so the hero stays consistent with the grid. */}
          <MediaCard item={autoBox.item} />
        </div>
      </div>
    </section>
  );
};
