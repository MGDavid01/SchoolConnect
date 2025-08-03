// src/hooks/useIoTNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../constants/api';

interface IoTNotification {
  _id: string; // MongoDB ObjectId como string
  grupoID: string;
  estudianteID: string;
  tutorID: string;
  fechaHora: string;
  leido: boolean;
  respondido: boolean;
  mensaje?: string;
}

export const useIoTNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<IoTNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar notificaciones (con indicador de carga)
  const loadNotifications = useCallback(async (filter: 'all' | 'unread' = 'all', showLoading: boolean = true) => {
    if (!user?._id) {
      console.log('❌ No hay usuario autenticado');
      setError('Usuario no autenticado. Por favor inicia sesión.');
      setNotifications([]);
      return;
    }

    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('✅ Cargando notificaciones para usuario:', user._id);
      const url = `${API_URL}/api/iot-notifications/student/${user._id}?unreadOnly=${filter === 'unread'}`;
      console.log('🌐 URL de la petición:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Respuesta del servidor:', response.status, response.statusText);

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Datos recibidos:', data);
        
        // Si no hay notificaciones, mostrar lista vacía sin error
        if (!data.data || data.data.length === 0) {
          setNotifications([]);
          setError(null);
          console.log('📭 No hay notificaciones para este usuario');
        } else {
          setNotifications(data.data);
          setError(null);
          console.log('📱 Notificaciones cargadas:', data.data.length);
        }
      } else {
        const errorText = await response.text();
        console.error('❌ Error del servidor:', response.status, errorText);
        
        if (response.status === 404) {
          // No hay notificaciones para este usuario
          setNotifications([]);
          setError(null);
          console.log('📭 No se encontraron notificaciones para este usuario');
        } else {
          throw new Error(`Error ${response.status}: ${errorText}`);
        }
      }
    } catch (error) {
      console.error('❌ Error cargando notificaciones:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('No se pudo conectar al servidor. Verifica tu conexión de red.');
      } else {
        setError(error instanceof Error ? error.message : 'No se pudieron cargar las notificaciones');
      }
      
      setNotifications([]);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [user?._id]);

  // Actualización silenciosa (sin indicadores)
  const silentUpdate = useCallback(async () => {
    if (!user?._id) return;

    try {
      const url = `${API_URL}/api/iot-notifications/student/${user._id}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setNotifications(data.data);
          setError(null);
        }
      }
    } catch (error) {
      console.error('Error en actualización silenciosa:', error);
      // No mostrar error en actualizaciones silenciosas
    }
  }, [user?._id]);

  // Marcar como leída
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      console.log('📝 Marcando como leída la notificación:', notificationId);
      
      const response = await fetch(
        `${API_URL}/api/iot-notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📡 Respuesta del servidor (marcar como leída):', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Notificación marcada como leída en la BD:', data);
        
        // Actualizar estado local
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, leido: true }
              : notif
          )
        );
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Error del servidor al marcar como leída:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error marcando como leída:', error);
      throw error;
    }
  }, []);

  // Responder a notificación
  const respondToNotification = useCallback(async (notificationId: string) => {
    try {
      console.log('📝 Respondiendo a la notificación:', notificationId);
      
      const response = await fetch(
        `${API_URL}/api/iot-notifications/${notificationId}/respond`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('📡 Respuesta del servidor (responder):', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Notificación respondida en la BD:', data);
        
        // Actualizar estado local
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, respondido: true, leido: true }
              : notif
          )
        );
        
        return true;
      } else {
        const errorText = await response.text();
        console.error('❌ Error del servidor al responder:', response.status, errorText);
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
    } catch (error) {
      console.error('❌ Error respondiendo a notificación:', error);
      throw error;
    }
  }, []);

  // Carga inicial con indicador de carga
  useEffect(() => {
    if (!user?._id) return;
    loadNotifications('all', true); // Carga inicial con loading
  }, [user?._id, loadNotifications]);

  // Polling silencioso cada 1 minuto
  useEffect(() => {
    if (!user?._id) return;

    const interval = setInterval(() => {
      silentUpdate(); // Actualización silenciosa
    }, 60000); // 60 segundos = 1 minuto

    return () => clearInterval(interval);
  }, [user?._id, silentUpdate]);

  return {
    notifications,
    loading,
    error,
    loadNotifications,
    markAsRead,
    respondToNotification,
  };
}; 