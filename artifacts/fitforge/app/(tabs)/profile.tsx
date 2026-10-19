import React, { useMemo, useState } from 'react';
import { Alert, Linking, Platform, Pressable, Share, Switch, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ActionButton, Body, Eyebrow, Page, Panel, Title } from '@/components/FitForgeUI';
import { useFitForge } from '@/context/FitForgeContext';
import { useColors } from '@/hooks/useColors';
import { disableTrainingReminders, enableTrainingReminders } from '@/lib/notifications';
import { localDateKey } from '@/lib/fitness';

function currentStreak(sessions: { date: string }[]) {
  const dates = new Set(sessions.map((session) => session.date));
  if (!dates.size) return 0;
  const today = new Date();
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (!dates.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  while (dates.has(localDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function PreferenceRow({
  title,
  detail,
  icon,
  onPress,
  right,
}: {
  title: string;
  detail: string;
  icon: React.ComponentProps<typeof Feather>['name'];
  onPress?: () => void;
  right?: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => ({ minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, opacity: pressed ? 0.7 : 1 })}
    >
      <View style={{ width: 38, height: 38, borderRadius: 13, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
        <Feather name={icon} size={17} color={colors.primary} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ color: colors.foreground, fontFamily: 'Inter_600SemiBold', fontSize: 13 }}>{title}</Text>
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 11 }}>{detail}</Text>
      </View>
      {right ?? (onPress ? <Feather name="chevron-right" size={17} color={colors.mutedForeground} /> : null)}
    </Pressable>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const { data, updateData, resetData } = useFitForge();
  const profile = data.profile;
  const [notificationError, setNotificationError] = useState('');
  const [canOpenSettings, setCanOpenSettings] = useState(false);
  const streak = useMemo(() => currentStreak(data.sessions), [data.sessions]);

  if (!profile) {
    return (
      <Page>
        <Eyebrow>YOUR FITFORGE</Eyebrow>
        <Title>Profile setup needed</Title>
        <Body>Finish onboarding before editing your profile.</Body>
        <ActionButton onPress={() => router.replace('/onboarding')}>Start onboarding</ActionButton>
      </Page>
    );
  }

  const toggleNotifications = async (enabled: boolean) => {
    setNotificationError('');
    setCanOpenSettings(false);
    try {
      if (enabled) {
        const ids = await enableTrainingReminders(profile.trainingWeekdays);
        await updateData((current) => ({ ...current, notificationsEnabled: true, notificationScheduleIds: ids }));
      } else {
        await disableTrainingReminders(data.notificationScheduleIds ?? []);
        await updateData((current) => ({ ...current, notificationsEnabled: false, notificationScheduleIds: [] }));
      }
    } catch (error) {
      setNotificationError(error instanceof Error ? error.message : 'Could not update workout reminders.');
      setCanOpenSettings(!!(error && typeof error === 'object' && 'canAskAgain' in error && error.canAskAgain === false));
    }
  };

  const toggleDarkMode = async (enabled: boolean) => {
    await updateData((current) => ({ ...current, darkModeEnabled: enabled }));
  };

  const exportData = async () => {
    try {
      await Share.share({
        title: 'FitForge data export',
        message: JSON.stringify({ exportedAt: new Date().toISOString(), ...data }, null, 2),
      });
    } catch {
      Alert.alert('Export unavailable', 'FitForge could not open the share sheet on this device.');
    }
  };

  const askReset = () => {
    Alert.alert(
      'Reset all FitForge data?',
      'This permanently removes your profile, workout history, food logs, measurements, saved exercises, and preferences from this device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset all data',
          style: 'destructive',
          onPress: async () => {
            try {
              await disableTrainingReminders(data.notificationScheduleIds ?? []);
              await resetData();
              router.replace('/');
            } catch (error) {
              Alert.alert('Reset failed', error instanceof Error ? error.message : 'Try again.');
            }
          },
        },
      ],
    );
  };

  return (
    <Page contentStyle={{ gap: 18 }}>
      <View style={{ gap: 8 }}>
        <Eyebrow>YOUR FITFORGE</Eyebrow>
        <Title>Profile</Title>
      </View>
      <Panel style={{ flexDirection: 'row', alignItems: 'center', gap: 15, padding: 19 }}>
        <View style={{ width: 66, height: 66, borderRadius: 21, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: colors.primaryForeground, fontFamily: 'Inter_700Bold', fontSize: 28 }}>{profile.firstName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 20 }}>{profile.firstName}</Text>
          <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 12 }}>{profile.goal} · {profile.level}</Text>
        </View>
        <Pressable accessibilityLabel="Edit training preferences" accessibilityRole="button" onPress={() => router.push('/profile-preferences')} style={{ width: 42, height: 42, alignItems: 'center', justifyContent: 'center' }}>
          <Feather name="edit-2" size={17} color={colors.primary} />
        </Pressable>
      </Panel>

      <View style={{ flexDirection: 'row', gap: 9 }}>
        {[
          { value: String(data.sessions.length), label: 'WORKOUTS' },
          { value: String(streak), label: 'STREAK' },
          { value: String(data.favoriteExerciseIds.length), label: 'SAVED' },
        ].map((stat) => (
          <Panel key={stat.label} style={{ flex: 1, padding: 14, gap: 8 }}>
            <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 21 }}>{stat.value}</Text>
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.7 }}>{stat.label}</Text>
          </Panel>
        ))}
      </View>

      <View style={{ gap: 9 }}>
        <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 17 }}>Preferences</Text>
        <Panel style={{ paddingVertical: 6, paddingHorizontal: 15 }}>
          <PreferenceRow
            title="Notifications"
            detail="Workout reminders on your training days"
            icon="bell"
            right={<Switch value={data.notificationsEnabled} onValueChange={(value) => void toggleNotifications(value)} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.foreground} testID="notifications-toggle" />}
          />
          {notificationError ? (
            <View style={{ paddingBottom: 9, gap: 6 }}>
              <Text accessibilityRole="alert" style={{ color: colors.destructive, fontFamily: 'Inter_500Medium', fontSize: 11 }}>{notificationError}</Text>
              {canOpenSettings ? (
                <Pressable accessibilityRole="button" onPress={() => void Linking.openSettings()} style={{ minHeight: 40, justifyContent: 'center' }}>
                  <Text style={{ color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 12 }}>Open device settings</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <PreferenceRow
            title="Dark mode"
            detail="Easy on the eyes at night"
            icon="moon"
            right={<Switch value={data.darkModeEnabled} onValueChange={(value) => void toggleDarkMode(value)} trackColor={{ false: colors.border, true: colors.primary }} thumbColor={colors.foreground} testID="dark-mode-toggle" />}
          />
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <PreferenceRow
            title="Training preferences"
            detail={`${profile.trainingDaysPerWeek} days per week · ${profile.level}`}
            icon="sliders"
            onPress={() => router.push('/profile-preferences')}
          />
        </Panel>
      </View>

      <View style={{ gap: 9 }}>
        <Text style={{ color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 17 }}>Account</Text>
        <Panel style={{ paddingVertical: 6, paddingHorizontal: 15 }}>
          <PreferenceRow
            title="Help & safety"
            detail="Exercise guidance and support"
            icon="help-circle"
            onPress={() => Alert.alert('Help & safety', 'Use a pain-free range, start with a manageable load, and stop if you feel sharp pain. FitForge guidance is educational and is not a substitute for professional medical advice.')}
          />
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <PreferenceRow
            title="About FitForge"
            detail="Version 1.0.0"
            icon="info"
            onPress={() => Alert.alert('FitForge', 'Version 1.0.0 · Built for steady, thoughtful training.')}
          />
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <PreferenceRow
            title="Language"
            detail={data.language}
            icon="globe"
            onPress={() => Alert.alert('Language', 'English is currently the available app language.')}
          />
          <View style={{ height: 1, backgroundColor: colors.border }} />
          <PreferenceRow title="Export data" detail="Share a copy of your saved FitForge data" icon="share" onPress={() => void exportData()} />
        </Panel>
      </View>

      <Pressable accessibilityRole="button" onPress={askReset} style={{ minHeight: 52, borderRadius: 16, borderWidth: 1, borderColor: `${colors.destructive}55`, alignItems: 'center', justifyContent: 'center' }} testID="reset-all-data">
        <Text style={{ color: colors.destructive, fontFamily: 'Inter_700Bold', fontSize: 13 }}>Reset all data</Text>
      </Pressable>
      {Platform.OS === 'web' ? (
        <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 10, textAlign: 'center' }}>
          Local reminders and Google Mobile Ads require a native iOS or Android build.
        </Text>
      ) : null}
    </Page>
  );
}
