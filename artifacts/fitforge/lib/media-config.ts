/**
 * Media configuration for FitForge exercise content.
 * 
 * Base URL for locally hosted exercise images and future videos.
 * All media is bundled with the app — no external hotlinking.
 */

export const MEDIA_CONFIG = {
  /** Base URL for exercise images (bundled locally) */
  exerciseImagesBaseUrl: '/assets/exercise-images',

  /** Base URL for exercise videos (future: expo-video) */
  exerciseVideosBaseUrl: '/assets/exercise-videos',

  /** Whether to use video when available (future: expo-video) */
  preferVideo: false,

  /** Cross-fade duration in milliseconds */
  crossFadeDuration: 1000,

  /** Hold time per pose in milliseconds */
  poseHoldDuration: 1000,
} as const;

export type MediaConfig = typeof MEDIA_CONFIG;
