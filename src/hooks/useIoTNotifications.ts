// src/hooks/useIoTNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../utils/notificationService';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../constants/api';

interface IoTNotification {
  _id: string;
  grupoID: string;
  estudianteID: string;
  tutorID: string;
  fechaHora: string;
  leido: boolean;
  respondido: boolean;
  mensaje?: string;
}

interface NotificationStats {
  total: number;
  leidas: number;
  respondidas: number;
  noLeidas: number;
}

export const useIoTNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<IoTNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Configurar notificaciones al inicializar
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Solicitar permisos
        await notificationService.requestPermissions();
        
        // Configurar listeners
        notificationService.setupNotificationListeners();
        
        // Obtener token de push
        const token = await notificationService.getExpoPushToken();
        if (token) {
          console.log('Token de notificación obtenido:', token);
          // Aquí podrías enviar el token al servidor para asociarlo con el usuario
        }
      } catch (error) {
        console.error('Error configurando notificaciones:', error);
      }
    };

    setupNotifications();
  }, []);

  // Cargar notificaciones
  const loadNotifications = useCallback(async (filter: 'all' | 'unread' = 'all') => {
    if (!user?._id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/iot-notifications/student/${user._id}?unreadOnly=${filter === 'unread'}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data || []);
      } else {
        throw new Error('Error cargando notificaciones');
      }
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
      setError('No se pudieron cargar las notificaciones');
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // Cargar estadísticas
  const loadStats = useCallback(async () => {
    if (!user?._id) return;

    try {
      const response = await fetch(
        `${API_URL}/iot-notifications/stats/${user._id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
        setUnreadCount(data.data?.noLeidas || 0);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  }, [user?._id]);

  // Marcar como leída
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/iot-notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        // Actualizar estado local
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, leido: true }
              : notif
          )
        );
        
        // Actualizar estadísticas
        await loadStats();
      }
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  }, [loadStats]);

  // Responder a notificación
  const respondToNotification = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(
        `${API_URL}/iot-notifications/${notificationId}/respond`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        // Actualizar estado local
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, respondido: true, leido: true }
              : notif
          )
        );
        
        // Actualizar estadísticas
        await loadStats();
        
        return true;
      }
    } catch (error) {
      console.error('Error respondiendo a notificación:', error);
    }
    
    return false;
  }, [loadStats]);

  // Crear nueva notificación (para testing)
  const createNotification = useCallback(async (notificationData: {
    grupoID: string;
    estudianteID: string;
    tutorID: string;
    mensaje?: string;
  }) => {
    try {
      const response = await fetch(`${API_URL}/iot-notifications/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationData),
      });

      if (response.ok) {
        // Recargar notificaciones
        await loadNotifications();
        await loadStats();
        return true;
      }
    } catch (error) {
      console.error('Error creando notificación:', error);
    }
    
    return false;
  }, [loadNotifications, loadStats]);

  // Enviar notificación local cuando se recibe una nueva
  const sendLocalNotification = useCallback(async (notification: IoTNotification) => {
    try {
      const notificationData = notificationService.createTutorCallNotification(
        notification.tutorID.split('@')[0],
        notification.grupoID,
        notification._id
      );

      await notificationService.sendLocalNotification(notificationData);
    } catch (error) {
      console.error('Error enviando notificación local:', error);
    }
  }, []);

  // Polling para nuevas notificaciones
  useEffect(() => {
    if (!user?._id) return;

    // Cargar datos iniciales
    loadNotifications();
    loadStats();

    // Configurar polling cada 30 segundos
    const interval = setInterval(() => {
      loadNotifications();
      loadStats();
    }, 30000);

    return () => clearInterval(interval);
  }, [user?._id, loadNotifications, loadStats]);

  // Verificar nuevas notificaciones y enviar notificaciones locales
  useEffect(() => {
    const checkNewNotifications = async () => {
      if (notifications.length > 0) {
        const unreadNotifications = notifications.filter(n => !n.leido);
        
        for (const notification of unreadNotifications) {
          // Solo enviar notificación local si es del usuario actual
          if (notification.estudianteID === user?._id) {
            await sendLocalNotification(notification);
          }
        }
      }
    };

    checkNewNotifications();
  }, [notifications, user?._id, sendLocalNotification]);

  return {
    notifications,
    stats,
    loading,
    error,
    unreadCount,
    loadNotifications,
    loadStats,
    markAsRead,
    respondToNotification,
    createNotification,
    sendLocalNotification,
  };
}; 