'use client';

import React from 'react';

export const VersionLog: React.FC = () => {
  return (
    <section className="space-y-3 rounded-3xl border border-zinc-800 bg-zinc-950/80 p-4 text-xs text-zinc-300">
      <header>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          GAIA Awakening · v3.3 Log
        </p>
        <p className="text-xs text-zinc-300">
          Gallery Awakening · Memory Vault · Week 1–6
        </p>
      </header>

      <div className="space-y-1 text-[11px] text-zinc-400">
        <p>
          <span className="font-semibold text-zinc-200">Version window:</span>{' '}
          Mon Dec 14, 2026 → Sun Jan 24, 2027
        </p>
        <p>
          <span className="font-semibold text-zinc-200">Scope:</span>{' '}
          Rebuild the Gallery as a living Memory Vault with images, local videos, Cloudflare R2
          thumbnails, Supabase metadata, and the same online + local brain used in Health and Wealth.
        </p>
      </div>

      <ul className="list-disc space-y-1 pl-4 text-[11px] text-zinc-400">
        <li>
          <span className="font-semibold text-zinc-200">Layout & foundations:</span> 3-column
          desktop / 2-column mobile grid for images and videos, with a fresh Gallery Awakening route
          separate from Genesis code.
        </li>
        <li>
          <span className="font-semibold text-zinc-200">R2 thumbnails & previews:</span> images and
          video thumbnails now live in Cloudflare R2, with up to six preview frames per video and
          graceful fallbacks when R2 or specific files are unreachable.
        </li>
        <li>
          <span className="font-semibold text-zinc-200">Feature of the Month:</span> auto-box logic
          that prefers pinned items, this month&apos;s memories, this week across years, and
          power/favorite-tagged memories before falling back.
        </li>
        <li>
          <span className="font-semibold text-zinc-200">Sync Center:</span> a dedicated panel that
          explains canonical rules (R2, local disk, Supabase) and surfaces a diff-style view for
          new/missing media.
        </li>
        <li>
          <span className="font-semibold text-zinc-200">Supabase + cache:</span> Gallery reads its
          media list from Supabase when online, with a local cache fallback so it can still function
          offline or when the DB is unreachable.
        </li>
        <li>
          <span className="font-semibold text-zinc-200">Filters, tags & views:</span> memories can be
          browsed by tags and sorted by recently added, most viewed, or most loved.
        </li>
        <li>
          <span className="font-semibold text-zinc-200">Memory Pulse:</span> a lightweight summary
          block that counts this month&apos;s memories, this year&apos;s additions, nostalgia-week
          items, power-tagged entries, and favorites – ready to connect to the Daily Thread in a
          future version.
        </li>
        <li>
          <span className="font-semibold text-zinc-200">Safety & resilience:</span> image and video
          components include graceful fallbacks when local paths or R2 assets are missing, avoiding
          broken UI even when storage is out of sync.
        </li>
      </ul>

      <p className="text-[11px] text-zinc-500">
        v3.3 closes with GAIA holding a small but complete Memory Vault: aware of where media lives,
        able to highlight one feature, and prepared to talk to the Daily Thread, Health and Wealth
        timelines in later levels.
      </p>
    </section>
  );
};
