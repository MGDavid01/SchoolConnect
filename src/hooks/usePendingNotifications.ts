// src/hooks/usePendingNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../constants/api';

interface PendingNotification {
  _id: string;
  grupoID: string;
  estudianteID: string;
  tutorID: string;
  fechaHora: string;
  leido: boolean;
  respondido: boolean;
  mensaje?: string;
}

export const usePendingNotifications = () => {
  const { user } = useAuth();
  const [pendingNotifications, setPendingNotifications] = useState<PendingNotification[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Cargar notificaciones pendientes (no leídas o no respondidas)
  const loadPendingNotifications = useCallback(async () => {
    if (!user?._id) {
      setPendingNotifications([]);
      setPendingCount(0);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/iot-notifications/student/${user._id}?unreadOnly=true`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const notifications = data.data || [];
        
        setPendingNotifications(notifications);
        setPendingCount(data.count || notifications.length);
      } else {
        setPendingNotifications([]);
        setPendingCount(0);
      }
    } catch (error) {
      console.error('Error cargando notificaciones pendientes:', error);
      setPendingNotifications([]);
      setPendingCount(0);
    } finally {
      setLoading(false);
    }
  }, [user?._id]);

  // Actualización silenciosa de notificaciones pendientes
  const silentUpdate = useCallback(async () => {
    if (!user?._id) return;

    try {
      const response = await fetch(
        `${API_URL}/api/iot-notifications/student/${user._id}?unreadOnly=true`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const notifications = data.data || [];
        
        setPendingNotifications(notifications);
        setPendingCount(data.count || notifications.length);
      }
    } catch (error) {
      console.error('Error en actualización silenciosa de pendientes:', error);
    }
  }, [user?._id]);

  // Carga inicial
  useEffect(() => {
    if (!user?._id) return;
    loadPendingNotifications();
  }, [user?._id, loadPendingNotifications]);

  // Polling silencioso cada 1 minuto
  useEffect(() => {
    if (!user?._id) return;

    const interval = setInterval(() => {
      silentUpdate();
    }, 60000); // 60 segundos = 1 minuto

    return () => clearInterval(interval);
  }, [user?._id, silentUpdate]);

  return {
    pendingNotifications,
    pendingCount,
    loading,
    loadPendingNotifications,
    silentUpdate,
  };
}; 