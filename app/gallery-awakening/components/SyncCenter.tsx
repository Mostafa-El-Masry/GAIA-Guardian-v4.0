'use client';

import React from 'react';
import type { SyncState, SyncDiff } from '../syncTypes';

interface SyncCenterProps {
  state: SyncState;
}

function statusLabel(status: SyncState['status']): { text: string; className: string } {
  switch (status) {
    case 'up_to_date':
      return {
        text: 'Up to date',
        className: 'bg-emerald-500/10 text-emerald-300 border-emerald-600/60'
      };
    case 'needs_attention':
      return {
        text: 'Needs attention',
        className: 'bg-amber-500/10 text-amber-300 border-amber-600/60'
      };
    default:
      return {
        text: 'Idle',
        className: 'bg-zinc-700/40 text-zinc-200 border-zinc-600/80'
      };
  }
}

function kindLabel(diff: SyncDiff): string {
  switch (diff.kind) {
    case 'new_r2_media':
      return 'New in R2';
    case 'missing_r2_media':
      return 'Missing from R2';
    case 'missing_local_video':
      return 'Missing local video';
    default:
      return 'Change';
  }
}

export const SyncCenter: React.FC<SyncCenterProps> = ({ state }) => {
  const s = statusLabel(state.status);

  const lastSynced =
    state.lastSyncedAt != null
      ? new Date(state.lastSyncedAt).toLocaleString()
      : 'Never synced';

  return (
    <section className="space-y-4 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-4 shadow-sm">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Gallery Sync Center
          </p>
          <p className="text-sm text-zinc-300">
            See how GAIA compares Cloudflare R2, local videos, and the Supabase metadata.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${s.className}`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            <span>{s.text}</span>
          </div>
          <button
            type="button"
            className="rounded-full border border-zinc-700 px-3 py-1 text-[11px] font-medium text-zinc-200 hover:border-zinc-400 hover:bg-zinc-900"
            disabled
            title="Sync logic will be wired in a later iteration. For now, this is a design-only control."
          >
            Sync now (coming later)
          </button>
        </div>
      </header>

      <div className="grid gap-3 text-xs text-zinc-300 md:grid-cols-3">
        <div className="space-y-1 rounded-2xl bg-zinc-900/80 p-3">
          <p className="font-medium text-zinc-100">R2 · Images & Thumbnails</p>
          <p className="text-[11px] text-zinc-400">{state.r2CanonicalNote}</p>
        </div>
        <div className="space-y-1 rounded-2xl bg-zinc-900/80 p-3">
          <p className="font-medium text-zinc-100">Local Disk · Videos</p>
          <p className="text-[11px] text-zinc-400">{state.localCanonicalNote}</p>
        </div>
        <div className="space-y-1 rounded-2xl bg-zinc-900/80 p-3">
          <p className="font-medium text-zinc-100">Supabase · Metadata</p>
          <p className="text-[11px] text-zinc-400">{state.metadataCanonicalNote}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
        <p>
          <span className="font-semibold text-zinc-200">Last sync:</span> {lastSynced}
        </p>
        <p>
          <span className="font-semibold text-zinc-200">Changes detected:</span>{' '}
          {state.diffs.length}
        </p>
      </div>

      <div className="space-y-2 rounded-2xl bg-zinc-900/80 p-3">
        {state.diffs.length === 0 ? (
          <p className="text-[11px] text-zinc-500">
            No differences detected between R2, local files, and metadata since the last sync.
          </p>
        ) : (
          <>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
              Diff summary
            </p>
            <ul className="space-y-2">
              {state.diffs.map((diff) => (
                <li
                  key={diff.id}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-zinc-100">
                      {diff.label}
                    </span>
                    <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-300">
                      {kindLabel(diff)}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-400">{diff.detail}</p>
                  {diff.suggestion && (
                    <p className="mt-1 text-[11px] text-emerald-300">
                      → {diff.suggestion}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
};
