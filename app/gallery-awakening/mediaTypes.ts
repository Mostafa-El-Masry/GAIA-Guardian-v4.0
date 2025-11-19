export type MediaSource =
  | 'local_video'
  | 'local_image'
  | 'r2_image'
  | 'r2_thumb'
  | 'r2_video';

export type MediaType = 'image' | 'video';

export interface VideoThumbnail {
  /**
   * Position of the thumbnail in the preview sequence (1..N).
   */
  index: number;
  /**
   * Cloudflare R2 object key for this thumbnail.
   * Example: "gallery/thumbs/egypt-trip-walk/thumb_001.jpg"
   */
  r2Key?: string;
  /**
   * Optional local thumbnail path (relative to /public).
   */
  localPath?: string;
  createdAt?: string; // ISO string
}

/**
 * Why GAIA chose a specific item for the auto-box.
 */
export type AutoBoxReason =
  | 'pinned'
  | 'this_month'
  | 'nostalgia_week'
  | 'power_tag'
  | 'favorite_tag'
  | 'fallback';

export interface MediaItem {
  /**
   * Local logical id for the Gallery. In Supabase this is usually the primary key.
   */
  id: string;
  slug: string;
  type: MediaType;
  title: string;
  description?: string;
  /**
   * Free tags: trip, family, power, etc.
   */
  tags: string[];
  source: MediaSource;
  /**
   * For images and thumbnails stored in Cloudflare R2.
   * Example: "gallery/photos/2024/egypt-trip-01.jpg"
   */
  r2Path?: string;
  /**
   * For local video files on disk.
   * Example (Windows): "D:/Media/Videos/Trips/egypt-trip-01.mp4"
   */
  localPath?: string;
  /**
   * Optional strip of preview thumbnails for videos, stored in R2.
   */
  thumbnails?: VideoThumbnail[];
  /**
   * Week 2: flags to support "add more previews for this video".
   */
  needsMoreThumbs?: boolean;
  desiredThumbnailCount?: number;
  /**
   * Week 3: metadata to help auto-box choose a good candidate.
   * These will later move to Supabase as canonical fields.
   */
  isFavorite?: boolean;
  viewCount?: number;
  /**
   * If true, this item is manually pinned as the Feature of the Month.
   */
  pinnedForFeature?: boolean;
  createdAt: string;  // ISO string
  updatedAt?: string; // ISO string
}
