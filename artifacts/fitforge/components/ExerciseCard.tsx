import React from 'react';
import { Feather } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { getGroupById, type Exercise } from '@/lib/exercises';

export default function ExerciseCard({
  exercise,
  saved,
  onPress,
  onBookmark,
}: {
  exercise: Exercise;
  saved?: boolean;
  onPress: () => void;
  onBookmark?: () => void;
}) {
  const colors = useColors();
  const group = getGroupById(exercise.group.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      testID={`exercise-card-${exercise.id}`}
      style={({ pressed }) => ({
        minHeight: 88,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 13,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        opacity: pressed ? 0.76 : 1,
      })}
    >
      <View style={{ width: 43, height: 43, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: `${group?.color ?? colors.primary}20` }}>
        <Feather name="activity" size={19} color={group?.color ?? colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 5 }}>
        <Text numberOfLines={1} style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 14 }}>{exercise.name}</Text>
        <Text numberOfLines={1} style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11 }}>{exercise.focus} · {exercise.equipment}</Text>
        <Text style={{ color: colors.primary, fontFamily: 'Inter_600SemiBold', fontSize: 11 }}>
          {exercise.sets} sets × {exercise.reps} <Text style={{ color: colors.mutedForeground }}>· {exercise.level}</Text>
        </Text>
      </View>
      {onBookmark ? (
        <Pressable
          accessibilityLabel={saved ? `Remove ${exercise.name} from saved exercises` : `Save ${exercise.name}`}
          accessibilityRole="button"
          hitSlop={10}
          onPress={(event) => { event.stopPropagation(); onBookmark(); }}
          testID={`bookmark-${exercise.id}`}
          style={{ width: 40, height: 44, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name={saved ? 'bookmark' : 'bookmark'} size={18} color={saved ? colors.primary : colors.mutedForeground} />
        </Pressable>
      ) : (
        <Feather name="chevron-right" size={17} color={colors.mutedForeground} />
      )}
    </Pressable>
  );
}
