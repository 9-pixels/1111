import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useFitForge } from '@/context/FitForgeContext';
import { LoadingView } from '@/components/FitForgeUI';

export default function EntryRoute() {
  const { data, isReady, loadError, retryLoad } = useFitForge();
  const colors = useColors();

  if (!isReady) return <LoadingView />;
  if (loadError) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 28, gap: 14 }}>
        <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 22 }}>Couldn’t open FitForge</Text>
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', textAlign: 'center' }}>{loadError}</Text>
        <Pressable onPress={retryLoad} accessibilityRole="button" testID="retry-store-load" style={{ minHeight: 50, backgroundColor: colors.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Text style={{ color: colors.primaryForeground, fontFamily: 'Inter_700Bold' }}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return <Redirect href={data.profile?.onboardingComplete ? '/home' : '/onboarding'} />;
}
