import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function enableTrainingReminders(weekdays: number[]) {
  if (Platform.OS === 'web') {
    throw new Error('Local workout reminders are only available in the mobile app.');
  }
  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (!permission.granted) {
    const error = new Error('Notification permission was not granted. You can enable it later in device settings.') as Error & { canAskAgain?: boolean };
    error.canAskAgain = permission.canAskAgain;
    throw error;
  }
  const identifiers: string[] = [];
  for (const day of weekdays) {
    const weekday = ((day + 1) % 7) + 1;
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'FitForge training day',
        body: 'Your session is ready when you are. Keep your reps steady and intentional.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday,
        hour: 8,
        minute: 0,
      },
    });
    identifiers.push(identifier);
  }
  return identifiers;
}

export async function disableTrainingReminders(identifiers: string[]) {
  await Promise.all(identifiers.map((identifier) => Notifications.cancelScheduledNotificationAsync(identifier)));
}
