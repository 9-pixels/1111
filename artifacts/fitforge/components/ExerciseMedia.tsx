import React, { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { MEDIA_CONFIG } from '@/lib/media-config';
import { exerciseImageRegistry } from '@/lib/exercise-image-registry';

export interface ExerciseMediaProps {
  /** Exercise ID used to look up media */
  exerciseId: string;
  /** Exercise name for display */
  exerciseName: string;
  /** Muscle group color for theming */
  accentColor: string;
  /** Whether media is available for this exercise */
  hasMedia: boolean;
  /** Image URLs for cross-fade (start and end poses) */
  imageUrls?: string[];
  /** Video URL for future expo-video support */
  videoUrl?: string;
  /** Caption shown below the media */
  caption?: string;
}

/**
 * ExerciseMedia — displays exercise demonstration media.
 * 
 * Priority: video (future) > image loop > placeholder.
 * Images alternate with a simple switch (no fade/animation).
 */
export function ExerciseMedia({
  exerciseId,
  exerciseName,
  accentColor,
  hasMedia,
  imageUrls = [],
  videoUrl,
  caption = 'Looped visual cue - slow and controlled',
}: ExerciseMediaProps) {
  const colors = useColors();
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPose, setCurrentPose] = useState(0);

  // Determine what to show
  const hasVideo = MEDIA_CONFIG.preferVideo && videoUrl;
  const registryEntry = exerciseImageRegistry[exerciseId];
  const hasImages = !!registryEntry || imageUrls.length >= 2;

  // Get image sources
  const startSource = registryEntry?.start ?? (imageUrls[0] ? { uri: imageUrls[0] } : undefined);
  const endSource = registryEntry?.end ?? (imageUrls[1] ? { uri: imageUrls[1] } : undefined);

  // Simple image alternation (no animation)
  useEffect(() => {
    if (!isPlaying || !hasImages || !startSource || !endSource) return;

    const interval = setInterval(() => {
      setCurrentPose((prev) => (prev === 0 ? 1 : 0));
    }, MEDIA_CONFIG.poseHoldDuration);

    return () => clearInterval(interval);
  }, [isPlaying, hasImages, startSource, endSource]);

  const togglePlayPause = () => {
    setIsPlaying((prev) => !prev);
  };

  // Future: Video player (expo-video)
  if (hasVideo) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.videoPlaceholder}>
          <Feather name="video" size={40} color={accentColor} />
          <Text style={[styles.videoText, { color: colors.mutedForeground }]}>
            Video player (expo-video)
          </Text>
        </View>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>{caption}</Text>
      </View>
    );
  }

  // Image loop (simple switch, no animation)
  if (hasImages && startSource && endSource) {
    const currentSource = currentPose === 0 ? startSource : endSource;

    return (
      <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable
          accessibilityLabel={isPlaying ? 'Pause animation' : 'Play animation'}
          accessibilityRole="button"
          onPress={togglePlayPause}
          style={styles.mediaArea}
        >
          <Image
            source={currentSource}
            style={styles.poseImage}
            resizeMode="contain"
          />
          {/* Play/Pause indicator */}
          <View style={styles.playPauseBadge}>
            <Feather
              name={isPlaying ? 'pause' : 'play'}
              size={14}
              color={colors.primaryForeground}
            />
          </View>
        </Pressable>
        <Text style={[styles.caption, { color: colors.mutedForeground }]}>{caption}</Text>
      </View>
    );
  }

  // Placeholder illustration
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.placeholder, { backgroundColor: `${accentColor}22` }]}>
        <Feather name="activity" size={40} color={accentColor} />
        <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>
          {exerciseName}
        </Text>
        <Text style={[styles.placeholderSubtext, { color: colors.mutedForeground }]}>
          No media available
        </Text>
      </View>
      <Text style={[styles.caption, { color: colors.mutedForeground }]}>
        Follow the written cues below
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  mediaArea: {
    height: 220,
    position: 'relative',
  },
  poseImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  playPauseBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholder: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  videoText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  placeholder: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  placeholderText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    textAlign: 'center',
  },
  placeholderSubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
  },
  caption: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
