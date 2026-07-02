import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { api } from '@/api';

// DAILY NUDGE — the one gentle invitation a day that keeps the brain growing.
// On launch we ask (once) for permission, get the device's Expo push token, and
// register it with the backend. A daily scheduler then sends "Eva is waiting in
// the garden…". Tapping a notification is handled by the OS deep-linking into
// the app; the ritual questions are already queued server-side.

// Foreground behaviour: show the nudge even while the app is open — a soft,
// non-intrusive reminder, never a badge-count growth buzzer.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Ask permission, fetch the Expo push token, and register it with the backend.
 *  Safe to call on every launch; it's idempotent and fails quietly (a device
 *  without notification support — e.g. a simulator — just skips). */
export async function registerForDailyNudge(): Promise<void> {
  try {
    const existing = await Notifications.getPermissionsAsync();
    let status = existing.status;
    if (status !== 'granted') {
      status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== 'granted') return;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('daily-ritual', {
        name: 'Daily ritual',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    // SDK 52 requires the EAS projectId to mint an Expo push token.
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      (Constants as { easConfig?: { projectId?: string } }).easConfig?.projectId;
    const { data: token } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    if (token) await api.registerPush(token, Platform.OS);
  } catch {
    // notifications are best-effort; the in-app ritual works without them
  }
}
