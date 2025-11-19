import { AutoBoxReason, MediaItem } from './mediaTypes';

export interface AutoBoxResult {
  item: MediaItem | null;
  reason: AutoBoxReason;
  label: string;
  description: string;
}

/**
 * Utility: same month as "now" (any year).
 */
function isSameMonthAnyYear(date: Date, now: Date): boolean {
  return date.getMonth() === now.getMonth();
}

/**
 * Utility: is this week (±3 days) in any year.
 */
function isSameWeekAnyYear(date: Date, now: Date): boolean {
  const oneDayMs = 24 * 60 * 60 * 1000;
  const diffDays = Math.abs(
    Math.round((Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) / oneDayMs)
  );
  return diffDays <= 3;
}

/**
 * Basic scoring function to break ties when we have multiple candidates.
 * Higher score wins.
 */
function baseScore(item: MediaItem): number {
  let score = 0;

  if (item.pinnedForFeature) score += 1000;
  if (item.isFavorite) score += 100;
  if (item.tags?.includes('power')) score += 20;
  if (item.tags?.includes('trip')) score += 10;

  const views = item.viewCount ?? 0;
  score += Math.min(views, 200); // cap to avoid crazy numbers

  return score;
}

function pickBest(candidates: MediaItem[]): MediaItem | null {
  if (!candidates.length) return null;
  return candidates.reduce((best, current) => {
    if (!best) return current;
    return baseScore(current) >= baseScore(best) ? current : best;
  }, candidates[0] as MediaItem | null);
}

/**
 * Main auto-box selector:
 * 1. If any pinned item → Feature of the Month (pinned).
 * 2. Else items from this month (any year) → "This Month's Spotlight".
 * 3. Else items from this week in other years → "From This Week, Years Ago".
 * 4. Else items tagged as power/favorite → "Power Photo / Power Video".
 * 5. Else fallback to first media item.
 */
export function getAutoBoxResult(
  items: MediaItem[],
  now: Date = new Date()
): AutoBoxResult {
  if (!items.length) {
    return {
      item: null,
      reason: 'fallback',
      label: 'No Feature',
      description: 'There are no media items yet. Add something to your Gallery to see a feature here.'
    };
  }

  // 1) Pinned item takes absolute priority.
  const pinned = items.filter((i) => i.pinnedForFeature);
  const pinnedBest = pickBest(pinned);
  if (pinnedBest) {
    return {
      item: pinnedBest,
      reason: 'pinned',
      label: 'Pinned Feature of the Month',
      description: 'You pinned this memory as the current feature. Auto-box logic is paused for now.'
    };
  }

  // 2) This month, any year.
  const thisMonthItems = items.filter((i) => {
    const d = new Date(i.createdAt);
    return isSameMonthAnyYear(d, now);
  });
  const thisMonthBest = pickBest(thisMonthItems);
  if (thisMonthBest) {
    return {
      item: thisMonthBest,
      reason: 'this_month',
      label: "This Month's Spotlight",
      description: 'Picked from memories captured in this month (any year).'
    };
  }

  // 3) Nostalgia: this week in other years.
  const thisWeekItems = items.filter((i) => {
    const d = new Date(i.createdAt);
    return isSameWeekAnyYear(d, now);
  });
  const thisWeekBest = pickBest(thisWeekItems);
  if (thisWeekBest) {
    return {
      item: thisWeekBest,
      reason: 'nostalgia_week',
      label: 'From This Week, Years Ago',
      description: 'A small nostalgia pull from this week across your timeline.'
    };
  }

  // 4) Power / favorite tagged.
  const powerOrFavorite = items.filter(
    (i) => i.tags?.includes('power') || i.isFavorite
  );
  const powerBest = pickBest(powerOrFavorite);
  if (powerBest) {
    const reason: AutoBoxReason = powerBest.tags?.includes('power')
      ? 'power_tag'
      : 'favorite_tag';

    return {
      item: powerBest,
      reason,
      label: 'Power Photo / Power Video',
      description: 'Chosen from items you marked as powerful or favorite.'
    };
  }

  // 5) Fallback – first item with highest baseScore overall.
  const fallback = pickBest(items);
  return {
    item: fallback,
    reason: 'fallback',
    label: 'Random Memory',
    description: 'Fallback feature chosen when no stronger context was found.'
  };
}
