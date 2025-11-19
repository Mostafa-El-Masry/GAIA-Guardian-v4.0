export type SyncStatus = 'idle' | 'up_to_date' | 'needs_attention';

export type SyncDiffKind =
  | 'new_r2_media'
  | 'missing_r2_media'
  | 'missing_local_video';

export interface SyncDiff {
  id: string;
  kind: SyncDiffKind;
  label: string;
  detail: string;
  suggestion?: string;
}

export interface SyncState {
  lastSyncedAt: string | null;
  /**
   * Overall status of the last sync comparison.
   */
  status: SyncStatus;
  /**
   * Human-readable notes about canonical responsibilities.
   */
  r2CanonicalNote: string;
  localCanonicalNote: string;
  metadataCanonicalNote: string;
  diffs: SyncDiff[];
}
