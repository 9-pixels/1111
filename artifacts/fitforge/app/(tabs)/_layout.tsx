import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router, Slot, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BannerAdSlot } from '@/components/Ads';
import { useFitForge } from '@/context/FitForgeContext';
import { useColors } from '@/hooks/useColors';

const tabs = [
  { name: 'home', title: 'Home', icon: 'home' },
  { name: 'workouts', title: 'Workouts', icon: 'activity' },
  { name: 'progress', title: 'Progress', icon: 'trending-up' },
  { name: 'nutrition', title: 'Nutrition', icon: 'coffee' },
  { name: 'profile', title: 'Profile', icon: 'user' },
] as const;

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const { data } = useFitForge();
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Slot />
      <View style={{ backgroundColor: colors.background }}>
        <BannerAdSlot />
        <View style={{
          height: (isWeb ? 84 : 60) + insets.bottom,
          paddingTop: 7,
          paddingBottom: isWeb ? 24 : Math.max(insets.bottom, 7),
          flexDirection: 'row',
          alignItems: 'center',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: isIOS ? 'transparent' : colors.background,
          overflow: 'hidden',
        }}>
          {isIOS ? (
            <BlurView
              intensity={90}
              tint={data.darkModeEnabled ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          {tabs.map((tab) => {
            const active = pathname.endsWith(`/${tab.name}`);
            const color = active ? colors.primary : colors.mutedForeground;
            return (
              <Pressable
                key={tab.name}
                accessibilityRole="tab"
                accessibilityLabel={tab.title}
                accessibilityState={{ selected: active }}
                onPress={() => router.replace(`/${tab.name}`)}
                style={{ flex: 1, minHeight: 50, alignItems: 'center', justifyContent: 'center', gap: 3 }}
              >
                <Feather name={tab.icon} size={19} color={color} />
                <Text style={{ color, fontFamily: 'Inter_600SemiBold', fontSize: 10 }}>{tab.title}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
