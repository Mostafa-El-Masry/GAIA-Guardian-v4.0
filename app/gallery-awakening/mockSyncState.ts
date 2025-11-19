import type { SyncState } from './syncTypes';

export const mockSyncState: SyncState = {
  lastSyncedAt: '2024-05-01T21:30:00.000Z',
  status: 'needs_attention',
  r2CanonicalNote:
    'Thumbnails & images → Cloudflare R2 is canonical. GAIA only lists keys that actually exist in the bucket.',
  localCanonicalNote:
    'Videos → Local disk is canonical. GAIA expects files to exist in the exact paths you give it.',
  metadataCanonicalNote:
    'Metadata (title, tags, favorites, view counts) → Supabase/DB is canonical. Local cache is just a mirror.',
  diffs: [
    {
      id: 'diff-1',
      kind: 'new_r2_media',
      label: 'New R2 image not in Gallery',
      detail: 'gallery/photos/2024/egypt/nile-sunset-02.jpg exists in R2 but has no Gallery entry yet.',
      suggestion: 'Create a new media item in Supabase with this R2 key, or ignore it on purpose.'
    },
    {
      id: 'diff-2',
      kind: 'new_r2_media',
      label: 'New R2 video thumbs',
      detail: 'gallery/thumbs/gym-session/thumb_004.jpg was added in R2 but not registered for the video yet.',
      suggestion: 'Attach this thumbnail to the existing gym-session video in Supabase.'
    },
    {
      id: 'diff-3',
      kind: 'missing_r2_media',
      label: 'Missing R2 file for existing media',
      detail: 'gallery/photos/2023/family/family-dinner-02.jpg is referenced in the DB but is missing from R2.',
      suggestion: 'Re-upload the file to R2 or remove the broken reference from Supabase.'
    },
    {
      id: 'diff-4',
      kind: 'missing_local_video',
      label: 'Missing local video file',
      detail: 'D:/Media/Videos/Trips/egypt-trip-street-walk-02.mp4 was expected but not found on disk.',
      suggestion: 'Fix the path, restore the file, or delete the media entry if it is no longer needed.'
    }
  ]
};
