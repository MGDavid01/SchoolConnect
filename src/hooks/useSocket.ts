// src/hooks/useSocket.ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { WS_URL } from '../constants/api';

export const useSocket = (userId?: string) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Conectar al servidor Socket.io
    socketRef.current = io(WS_URL);

    // Configurar eventos básicos
    socketRef.current.on('connect', () => {
      console.log('Conectado a Socket.io');
      
      // Unirse a la sala del estudiante si hay userId
      if (userId) {
        socketRef.current?.emit('join-student', userId);
      }
    });

    socketRef.current.on('disconnect', () => {
      console.log('Desconectado de Socket.io');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Error conectando a Socket.io:', error);
    });

    // Limpiar al desmontar
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [userId]);

  // Función para escuchar eventos de notificaciones IoT
  const listenToIoTNotifications = (callback: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new-iot-notification', callback);
    }
  };

  // Función para dejar de escuchar
  const stopListening = () => {
    if (socketRef.current) {
      socketRef.current.off('new-iot-notification');
    }
  };

  return {
    socket: socketRef.current,
    listenToIoTNotifications,
    stopListening
  };
}; 