'use client';

import React, { useRef, useState } from 'react';
import type { MediaItem } from '../mediaTypes';
import { getR2Url } from '../r2';

interface MediaCardProps {
  item: MediaItem;
}

const normalizeLocalPath = (p?: string) => {
  if (!p) return '';
  return p.startsWith('http') ? p : `/${p.replace(/^\/+/, '')}`;
};

export const MediaCard: React.FC<MediaCardProps> = ({ item }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [imageBroken, setImageBroken] = useState(false);
  const [videoError, setVideoError] = useState(false);

  const videoSrc = item.localPath
    ? normalizeLocalPath(item.localPath)
    : item.r2Path
      ? getR2Url(item.r2Path)
      : '';

  const handleSkip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const duration = video.duration || Infinity;
    const next = video.currentTime + seconds;
    video.currentTime = Math.max(0, Math.min(duration, next));
  };

  const handleVolumeStep = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Math.max(0, Math.min(1, video.volume + delta));
    video.volume = next;
  };

  const renderImage = () => {
    const src = item.r2Path && !imageBroken
      ? getR2Url(item.r2Path)
      : item.localPath && !imageBroken
        ? normalizeLocalPath(item.localPath)
        : '/placeholder-gallery-image.png';

    return (
      <img
        src={src}
        alt={item.title}
        className="h-40 w-full object-cover"
        onError={() => setImageBroken(true)}
      />
    );
  };

  const renderVideoPreviewStrip = () => {
    if (!item.thumbnails || item.thumbnails.length === 0) {
      return (
        <p className="mt-1 text-[10px] text-zinc-500">
          No preview thumbnails yet. Mark this video to generate more thumbs later.
        </p>
      );
    }

    return (
      <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
        {item.thumbnails.map((thumb) => {
          const thumbSrc = thumb.localPath
            ? normalizeLocalPath(thumb.localPath)
            : thumb.r2Key
              ? getR2Url(thumb.r2Key)
              : '/placeholder-gallery-image.png';
          return (
            <img
              key={thumb.index}
              src={thumbSrc}
              alt={`${item.title} preview ${thumb.index}`}
              className="h-10 w-14 flex-none rounded-md border border-zinc-800 object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-gallery-image.png';
              }}
            />
          );
        })}
      </div>
    );
  };

  const renderVideoBody = () => {
    if (!videoSrc) {
      return (
        <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/80 text-[11px] text-zinc-400">
          Video path is missing. Check your Gallery metadata or Sync Center.
        </div>
      );
    }

    if (videoError) {
      return (
        <div className="flex h-40 w-full items-center justify-center rounded-xl border border-dashed border-zinc-700 bg-zinc-900/80 text-[11px] text-zinc-400">
          GAIA could not load this video. Make sure the file exists and the path is correct.
        </div>
      );
    }

    return (
      <video
        ref={videoRef}
        src={videoSrc}
        className="h-40 w-full object-cover"
        controls
        onError={() => setVideoError(true)}
      />
    );
  };

  const sourceLabel = item.source?.startsWith('r2') ? 'R2' : 'Local';

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-800/60 bg-zinc-900/60 p-3 shadow-sm backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wide text-zinc-500">
        <span>{item.type === 'image' ? 'Image' : 'Video'}</span>
        <div className="flex items-center gap-1">
          <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-300">
            {sourceLabel}
          </span>
          {typeof item.viewCount === 'number' && (
            <span className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] text-zinc-300">
              Views {item.viewCount}
            </span>
          )}
          {item.isFavorite && (
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
              Favorite
            </span>
          )}
        </div>
      </div>

      {item.type === 'image' ? (
        <div className="relative mb-3 overflow-hidden rounded-xl bg-zinc-800/80">
          {/* Still simple <img>; later we can switch to Next/Image. */}
          {renderImage()}
        </div>
      ) : (
        <div className="mb-3 space-y-2">
          <div className="relative overflow-hidden rounded-xl bg-black">
            {renderVideoBody()}
          </div>
          {/* Simple controls for quick scrubbing/volume changes */}
          {!videoError && videoSrc && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleSkip(-10)}
                className="rounded-full border border-zinc-700 px-3 py-1 hover:border-zinc-400 hover:bg-zinc-800"
              >
                Rewind 10s
              </button>
              <button
                type="button"
                onClick={() => handleSkip(10)}
                className="rounded-full border border-zinc-700 px-3 py-1 hover:border-zinc-400 hover:bg-zinc-800"
              >
                Forward 10s
              </button>

              <span className="mx-1 h-4 w-px bg-zinc-700" />

              <button
                type="button"
                onClick={() => handleVolumeStep(-0.03)}
                className="rounded-full border border-zinc-700 px-3 py-1 hover:border-zinc-400 hover:bg-zinc-800"
              >
                Vol -
              </button>
              <button
                type="button"
                onClick={() => handleVolumeStep(0.03)}
                className="rounded-full border border-zinc-700 px-3 py-1 hover:border-zinc-400 hover:bg-zinc-800"
              >
                Vol +
              </button>
            </div>
          )}

          {/* Video preview strip powered by R2 thumbnails */}
          {renderVideoPreviewStrip()}
        </div>
      )}

      <div className="mt-auto">
        <h3 className="text-sm font-semibold text-zinc-50 line-clamp-2">{item.title}</h3>
        {item.description && (
          <p className="mt-1 text-xs text-zinc-400 line-clamp-3">{item.description}</p>
        )}
        {item.tags?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
