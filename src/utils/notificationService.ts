// src/utils/notificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar el comportamiento de las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface NotificationData {
  title: string;
  body: string;
  data?: any;
}

export class NotificationService {
  private static instance: NotificationService;
  private expoPushToken: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Solicitar permisos de notificación
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Permisos de notificación no otorgados');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error solicitando permisos de notificación:', error);
      return false;
    }
  }

  // Obtener el token de Expo Push
  async getExpoPushToken(): Promise<string | null> {
    try {
      if (this.expoPushToken) {
        return this.expoPushToken;
      }

      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PROJECT_ID, // Necesitarás configurar esto
      });

      this.expoPushToken = token.data;
      return this.expoPushToken;
    } catch (error) {
      console.error('Error obteniendo token de notificación:', error);
      return null;
    }
  }

  // Enviar notificación local
  async sendLocalNotification(notification: NotificationData): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title,
          body: notification.body,
          data: notification.data || {},
          sound: 'default',
        },
        trigger: null, // Enviar inmediatamente
      });
    } catch (error) {
      console.error('Error enviando notificación local:', error);
    }
  }

  // Enviar notificación push a través de Expo
  async sendPushNotification(
    expoPushToken: string,
    notification: NotificationData
  ): Promise<boolean> {
    try {
      const message = {
        to: expoPushToken,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data || {},
      };

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (response.ok) {
        console.log('Notificación push enviada exitosamente');
        return true;
      } else {
        console.error('Error enviando notificación push:', response.status);
        return false;
      }
    } catch (error) {
      console.error('Error enviando notificación push:', error);
      return false;
    }
  }

  // Configurar listeners para notificaciones
  setupNotificationListeners(): void {
    // Listener para cuando se recibe una notificación
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notificación recibida:', notification);
    });

    // Listener para cuando se toca una notificación
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notificación tocada:', response);
      // Aquí puedes manejar la navegación cuando se toca la notificación
      const data = response.notification.request.content.data;
      if (data?.screen) {
        // Navegar a la pantalla específica
        // navigation.navigate(data.screen);
      }
    });
  }

  // Crear notificación para llamada de tutor
  createTutorCallNotification(
    tutorName: string,
    grupoID: string,
    notificationId: string
  ): NotificationData {
    return {
      title: 'Llamada de Tutor',
      body: `${tutorName} te está llamando desde el grupo ${grupoID}`,
      data: {
        type: 'tutor_call',
        notificationId,
        grupoID,
        tutorName,
        screen: 'IoTNotifications',
      },
    };
  }

  // Programar notificación para recordatorio
  async scheduleReminderNotification(
    title: string,
    body: string,
    triggerDate: Date,
    data?: any
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: {
          date: triggerDate,
        },
      });
    } catch (error) {
      console.error('Error programando notificación:', error);
    }
  }

  // Cancelar todas las notificaciones programadas
  async cancelAllScheduledNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error cancelando notificaciones:', error);
    }
  }

  // Obtener notificaciones pendientes
  async getPendingNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error obteniendo notificaciones pendientes:', error);
      return [];
    }
  }
}

// Exportar instancia singleton
export const notificationService = NotificationService.getInstance(); 