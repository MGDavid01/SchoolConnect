// src/screens/IoTNotificationsScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Clipboard,
  ViewStyle,
  TextStyle,
  ScrollView,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { useIoTNotifications } from '../hooks/useIoTNotifications';
import { usePendingNotifications } from '../hooks/usePendingNotifications';
import { useAuth } from '../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/theme';

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

const TABS = [
  { key: 'pendientes', label: 'Pendientes' },
  { key: 'leidas', label: 'Leídas' },
];

// Función para formatear fechas
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  
  // Formato de fecha: "1 de julio, 2025"
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  const fecha = date.toLocaleDateString('es-ES', options);
  
  // Formato de hora: "2:30 PM"
  const hora = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  return { fecha, hora };
};

const IoTNotificationsScreen: React.FC = () => {
  const { user } = useAuth();
  const {
    notifications,
    loading,
    error,
    loadNotifications,
    markAsRead,
    respondToNotification,
  } = useIoTNotifications();

  const { pendingCount } = usePendingNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pendientes' | 'leidas'>('pendientes');

  // Filtrar notificaciones según la pestaña activa
  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'pendientes') {
      return !notification.leido;
    } else {
      return notification.leido;
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadNotifications('all', false);
    } catch (error) {
      console.log('Error al refrescar:', error);
    }
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
      Alert.alert('Éxito', 'Notificación marcada como leída');
    } catch (error) {
      console.log('Error marcando como leída:', error);
      Alert.alert('Error', 'No se pudo marcar como leída');
    }
  };

  const handleRespond = async (notificationId: string, tutorEmail: string) => {
    try {
      // Primero marcar como respondida en la base de datos
      const success = await respondToNotification(notificationId);
      
      if (success) {
        // Copiar el correo del tutor al portapapeles
        await Clipboard.setString(tutorEmail);
        
        Alert.alert(
          'Correo copiado', 
          `El correo del tutor (${tutorEmail}) ha sido copiado al portapapeles`
        );
      } else {
        Alert.alert('Error', 'No se pudo responder a la llamada');
      }
    } catch (error) {
      console.log('Error copiando correo:', error);
      Alert.alert('Error', 'No se pudo copiar el correo al portapapeles');
    }
  };

  const renderNotification = ({ item }: { item: IoTNotification }) => {
    const { fecha, hora } = formatDate(item.fechaHora);
    
    return (
      <View style={[
        styles.notificationItem, 
        !item.leido && styles.unreadItem,
        item.respondido && styles.respondedItem
      ]}>
        <View style={styles.notificationInfo}>
          <View style={styles.notificationTop}>
            <Text style={styles.tutorText}>
              {item.tutorID}
            </Text>
            <View style={styles.statusContainer}>
              {!item.leido && (
                <View style={styles.unreadBadge}>
                  <Text style={styles.unreadBadgeText}>Nuevo</Text>
                </View>
              )}
              {item.respondido && (
                <View style={styles.respondedBadge}>
                  <Text style={styles.respondedBadgeText}>Respondido</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.messageText}>{item.mensaje}</Text>
          <View style={styles.timeContainer}>
            <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.timeText}>{fecha} • {hora}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          {!item.leido && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleMarkAsRead(item._id)}
            >
              <Ionicons name="checkmark-outline" size={16} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Leída</Text>
            </TouchableOpacity>
          )}
          
          {!item.respondido && (
            <TouchableOpacity
              style={[styles.actionButton, styles.respondButton]}
              onPress={() => handleRespond(item._id, item.tutorID)}
            >
              <Ionicons name="copy-outline" size={16} color="#FFF" />
              <Text style={styles.respondButtonText}>Copiar</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    const emptyMessages = {
      pendientes: {
        icon: 'notifications-off',
        title: 'No hay notificaciones pendientes',
      },
      leidas: {
        icon: 'checkmark-circle',
        title: 'No hay notificaciones leídas',
      }
    };

    const message = emptyMessages[activeTab];

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name={message.icon as any} size={80} color={COLORS.textSecondary} />
        </View>
        <Text style={styles.emptyText}>{message.title}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.tabsContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.key as 'pendientes' | 'leidas')}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <ScrollView style={styles.scrollView}>
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Ionicons name="refresh" size={16} color="#FFF" />
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <Ionicons name="hourglass-outline" size={32} color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando notificaciones...</Text>
          </View>
        )}

        {!loading && !error && (
          <FlatList
            data={filteredNotifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item._id}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
    marginBottom: 2,
    elevation: 3,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: COLORS.secondary,
    backgroundColor: COLORS.background,
    elevation: 2,
  },
  tabLabel: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: COLORS.primary,
  },
  errorContainer: {
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginVertical: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  retryButtonText: {
    color: COLORS.surface,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 12,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    backgroundColor: COLORS.surface,
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  unreadItem: {
    borderLeftWidth: 6,
    borderLeftColor: COLORS.primary,
    backgroundColor: 'rgba(122, 21, 37, 0.05)',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.1,
  },
  respondedItem: {
    borderLeftWidth: 6,
    borderLeftColor: COLORS.secondary,
    backgroundColor: 'rgba(183, 142, 74, 0.05)',
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tutorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
    textTransform: 'capitalize',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  unreadBadgeText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  respondedBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  respondedBadgeText: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  messageText: {
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(183, 142, 74, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  timeText: {
    fontSize: 13,
    color: COLORS.secondary,
    marginLeft: 6,
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(122, 21, 37, 0.1)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    minWidth: 80,
  },
  actionButtonText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  respondButton: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  respondButtonText: {
    fontSize: 14,
    color: COLORS.surface,
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 60,
  },
  emptyIconContainer: {
    marginBottom: 24,
    backgroundColor: 'rgba(122, 21, 37, 0.1)',
    padding: 20,
    borderRadius: 50,
  },
  emptyText: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default IoTNotificationsScreen; 