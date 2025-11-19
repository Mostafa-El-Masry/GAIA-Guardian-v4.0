import { MediaItem } from './mediaTypes';

export const mockMediaItems: MediaItem[] = [
  {
    id: 'img-1',
    slug: 'egypt-nile-sunset',
    type: 'image',
    title: 'Nile Sunset · Cairo',
    description: 'Warm sunset over the Nile – quiet and powerful.',
    tags: ['trip', 'egypt', 'sunset', 'power'],
    source: 'r2_image',
    r2Path: 'gallery/photos/2024/egypt/nile-sunset-01.jpg',
    createdAt: '2024-02-10T18:30:00.000Z',
    updatedAt: '2024-02-10T18:30:00.000Z',
    isFavorite: true,
    viewCount: 42
  },
  {
    id: 'img-2',
    slug: 'desk-setup-night',
    type: 'image',
    title: 'Night Desk Setup',
    description: 'Coding corner at 2AM – GAIA planning session.',
    tags: ['work', 'night', 'gaia'],
    source: 'r2_image',
    r2Path: 'gallery/photos/2024/home/desk-setup-night-01.jpg',
    createdAt: '2024-03-02T22:15:00.000Z',
    updatedAt: '2024-03-02T22:15:00.000Z',
    viewCount: 17
  },
  {
    id: 'img-3',
    slug: 'family-dinner',
    type: 'image',
    title: 'Family Dinner',
    description: 'Simple dinner, loud laughs.',
    tags: ['family', 'memory'],
    source: 'r2_image',
    r2Path: 'gallery/photos/2023/family/family-dinner-01.jpg',
    createdAt: '2023-12-25T19:45:00.000Z',
    updatedAt: '2023-12-25T19:45:00.000Z',
    isFavorite: true,
    viewCount: 30
  },
  {
    id: 'vid-1',
    slug: 'egypt-trip-walk',
    type: 'video',
    title: 'Walking in Cairo Streets',
    description: 'Fast walk between old streets – noisy, alive.',
    tags: ['trip', 'egypt', 'walk'],
    source: 'local_video',
    localPath: 'D:/Media/Videos/Trips/egypt-trip-street-walk-01.mp4',
    createdAt: '2024-02-11T09:00:00.000Z',
    updatedAt: '2024-02-11T09:00:00.000Z',
    thumbnails: [
      {
        index: 1,
        r2Key: 'gallery/thumbs/egypt-trip-walk/thumb_001.jpg'
      },
      {
        index: 2,
        r2Key: 'gallery/thumbs/egypt-trip-walk/thumb_002.jpg'
      },
      {
        index: 3,
        r2Key: 'gallery/thumbs/egypt-trip-walk/thumb_003.jpg'
      },
      {
        index: 4,
        r2Key: 'gallery/thumbs/egypt-trip-walk/thumb_004.jpg'
      },
      {
        index: 5,
        r2Key: 'gallery/thumbs/egypt-trip-walk/thumb_005.jpg'
      },
      {
        index: 6,
        r2Key: 'gallery/thumbs/egypt-trip-walk/thumb_006.jpg'
      }
    ],
    desiredThumbnailCount: 6,
    viewCount: 55,
    isFavorite: true
  },
  {
    id: 'vid-2',
    slug: 'gym-session',
    type: 'video',
    title: 'Gym Session – Back Day',
    description: 'Short clip from a back workout – Health Awakening vibes.',
    tags: ['health', 'gym', 'power'],
    source: 'local_video',
    localPath: 'D:/Media/Videos/Health/gym-back-day-01.mp4',
    createdAt: '2024-04-05T17:10:00.000Z',
    updatedAt: '2024-04-05T17:10:00.000Z',
    thumbnails: [
      {
        index: 1,
        r2Key: 'gallery/thumbs/gym-session/thumb_001.jpg'
      },
      {
        index: 2,
        r2Key: 'gallery/thumbs/gym-session/thumb_002.jpg'
      },
      {
        index: 3,
        r2Key: 'gallery/thumbs/gym-session/thumb_003.jpg'
      }
    ],
    needsMoreThumbs: true,
    desiredThumbnailCount: 6,
    isFavorite: true,
    viewCount: 65,
    pinnedForFeature: true
  },
  {
    id: 'vid-3',
    slug: 'coding-timelapse',
    type: 'video',
    title: 'Coding Timelapse – GAIA Night',
    description: 'Timelapse of a long GAIA coding night.',
    tags: ['work', 'gaia', 'timelapse'],
    source: 'local_video',
    localPath: 'D:/Media/Videos/Work/gaia-coding-night-01.mp4',
    createdAt: '2023-01-18T21:00:00.000Z',
    updatedAt: '2023-01-18T21:00:00.000Z',
    thumbnails: [
      {
        index: 1,
        r2Key: 'gallery/thumbs/coding-timelapse/thumb_001.jpg'
      },
      {
        index: 2,
        r2Key: 'gallery/thumbs/coding-timelapse/thumb_002.jpg'
      },
      {
        index: 3,
        r2Key: 'gallery/thumbs/coding-timelapse/thumb_003.jpg'
      },
      {
        index: 4,
        r2Key: 'gallery/thumbs/coding-timelapse/thumb_004.jpg'
      }
    ],
    desiredThumbnailCount: 4,
    viewCount: 25
  }
];
