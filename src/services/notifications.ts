import { Platform } from 'react-native';

let Notifications: any = null;

try {
  Notifications = require('expo-notifications');
} catch {
  // expo-notifications not available in Expo Go
}

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function requestPermissions(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return false;
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('recurring', {
        name: 'Recurring Transactions',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    return true;
  } catch {
    return false;
  }
}

export async function scheduleRecurringNotification(
  recurringId: number,
  label: string,
  nextDueDate: string,
  notificationTime: string,
): Promise<string | null> {
  if (!Notifications) return null;
  try {
    const [hours, minutes] = notificationTime.split(':').map(Number);
    let fireDate = new Date(nextDueDate + 'T' + notificationTime + ':00');

    if (fireDate.getTime() <= Date.now()) {
      fireDate = new Date();
      fireDate.setHours(hours, minutes, 0, 0);
      if (fireDate.getTime() <= Date.now()) {
        fireDate.setDate(fireDate.getDate() + 1);
      }
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recurring Transaction Due',
        body: `${label} is due today`,
        data: { recurringId },
        ...(Platform.OS === 'android' ? { channelId: 'recurring' } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      },
    });
    return id;
  } catch {
    return null;
  }
}

export async function cancelScheduledNotification(
  notificationId: string,
): Promise<void> {
  if (!Notifications) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {}
}

export async function cancelAllRecurring(): Promise<void> {
  if (!Notifications) return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.content.data?.recurringId !== undefined) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  } catch {}
}

export async function cancelNotificationForRecurringId(
  recurringId: number,
): Promise<void> {
  if (!Notifications) return;
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of scheduled) {
      if (n.content.data?.recurringId === recurringId) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  } catch {}
}

export function addNotificationResponseListener(
  handler: (recurringId: number) => void,
): { remove: () => void } {
  if (!Notifications) return { remove: () => {} };
  try {
    const sub = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        const recurringId = response.notification.request.content.data
          ?.recurringId as number | undefined;
        if (recurringId) handler(recurringId);
      },
    );
    return sub;
  } catch {
    return { remove: () => {} };
  }
}
