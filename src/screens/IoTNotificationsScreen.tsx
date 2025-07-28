// src/screens/IoTNotificationsScreen.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import IoTNotificationCard from '../components/IoTNotificationCard';
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

const IoTNotificationsScreen: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<IoTNotification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = useCallback(async () => {
    try {
      if (!user?._id) return;

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
        console.error('Error fetching notifications:', response.status);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'No se pudieron cargar las notificaciones');
    }
  }, [user?._id, filter]);

  const fetchStats = useCallback(async () => {
    try {
      if (!user?._id) return;

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
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [user?._id]);

  const markAsRead = async (notificationId: string) => {
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
        // Actualizar el estado local
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, leido: true }
              : notif
          )
        );
        
        // Actualizar estadísticas
        fetchStats();
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const respondToNotification = async (notificationId: string) => {
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
        // Actualizar el estado local
        setNotifications(prev =>
          prev.map(notif =>
            notif._id === notificationId
              ? { ...notif, respondido: true, leido: true }
              : notif
          )
        );
        
        Alert.alert(
          'Éxito',
          'Has respondido a la llamada de tu tutor',
          [{ text: 'OK' }]
        );
        
        // Actualizar estadísticas
        fetchStats();
      }
    } catch (error) {
      console.error('Error responding to notification:', error);
      Alert.alert('Error', 'No se pudo responder a la notificación');
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchNotifications(), fetchStats()]);
    setRefreshing(false);
  }, [fetchNotifications, fetchStats]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchNotifications(), fetchStats()]);
      setLoading(false);
    };

    loadData();
  }, [fetchNotifications, fetchStats]);

  const renderNotification = ({ item }: { item: IoTNotification }) => (
    <IoTNotificationCard
      notification={item}
      onMarkAsRead={markAsRead}
      onRespond={respondToNotification}
      currentUserId={user?._id || ''}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Notificaciones IoT</Text>
      
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.noLeidas}</Text>
            <Text style={styles.statLabel}>Sin leer</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.respondidas}</Text>
            <Text style={styles.statLabel}>Respondidas</Text>
          </View>
        </View>
      )}

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            Todas
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, filter === 'unread' && styles.filterActive]}
          onPress={() => setFilter('unread')}
        >
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>
            Sin leer
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off" size={64} color="#CCCCCC" />
      <Text style={styles.emptyTitle}>No hay notificaciones</Text>
      <Text style={styles.emptySubtitle}>
        {filter === 'unread' 
          ? 'No tienes notificaciones sin leer'
          : 'No has recibido llamadas de tutores aún'
        }
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Cargando notificaciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  listContainer: {
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  filterActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FF6B35',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});

export default IoTNotificationsScreen; 