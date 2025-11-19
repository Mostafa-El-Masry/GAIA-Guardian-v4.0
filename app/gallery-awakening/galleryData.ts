import type { MediaItem, MediaType, MediaSource, VideoThumbnail } from './mediaTypes';

/**
 * Suggested Supabase table: gallery_media_items
 *
 * Columns (you can adapt names, but keep the intent):
 *
 *  id                 uuid / text (primary key)
 *  type               text ('image' | 'video')
 *  title              text
 *  description        text
 *  tags               text[] or jsonb
 *  source             text ('local_video' | 'local_image' | 'r2_image' | 'r2_thumb' | 'r2_video')
 *  r2_path            text
 *  local_path         text
 *  thumbnails         jsonb (array of { index, r2Key })
 *  needs_more_thumbs  boolean
 *  desired_thumb_cnt  integer
 *  is_favorite        boolean
 *  view_count         integer
 *  pinned_for_feature boolean
 *  created_at         timestamptz
 *  updated_at         timestamptz
 */
export interface GalleryMediaRow {
  id: string;
  type: MediaType;
  title: string;
  description: string | null;
  tags: string[] | null;
  source: MediaSource;
  r2_path: string | null;
  local_path: string | null;
  thumbnails: VideoThumbnail[] | null;
  needs_more_thumbs: boolean | null;
  desired_thumb_cnt: number | null;
  is_favorite: boolean | null;
  view_count: number | null;
  pinned_for_feature: boolean | null;
  created_at: string;
  updated_at: string | null;
}

/**
 * Suggested Supabase table: gallery_views
 *
 * Columns:
 *  id         bigint / uuid
 *  media_id   references gallery_media_items.id
 *  viewed_at  timestamptz
 *  device_tag text (optional, e.g., 'home-pc', 'work-laptop')
 */
export interface GalleryViewRow {
  id: string;
  media_id: string;
  viewed_at: string;
  device_tag: string | null;
}

/**
 * Suggested Supabase table: gallery_auto_box_history
 *
 * Columns:
 *  id             bigint / uuid
 *  media_id       references gallery_media_items.id
 *  reason         text (AutoBoxReason)
 *  featured_at    timestamptz
 */
export interface GalleryAutoBoxHistoryRow {
  id: string;
  media_id: string;
  reason: string;
  featured_at: string;
}

/**
 * Map a Supabase gallery_media_items row into our in-memory MediaItem.
 */
export function mapRowToMediaItem(row: GalleryMediaRow): MediaItem {
  return {
    id: row.id,
    slug: row.id, // You can later store a dedicated slug in DB if you prefer.
    type: row.type,
    title: row.title,
    description: row.description ?? undefined,
    tags: row.tags ?? [],
    source: row.source,
    r2Path: row.r2_path ?? undefined,
    localPath: row.local_path ?? undefined,
    thumbnails: row.thumbnails ?? undefined,
    needsMoreThumbs: row.needs_more_thumbs ?? undefined,
    desiredThumbnailCount: row.desired_thumb_cnt ?? undefined,
    isFavorite: row.is_favorite ?? undefined,
    viewCount: row.view_count ?? undefined,
    pinnedForFeature: row.pinned_for_feature ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined
  };
}
