// src/components/IoTNotificationCard.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

interface IoTNotificationCardProps {
  notification: IoTNotification;
  onMarkAsRead: (notificationId: string) => void;
  onRespond: (notificationId: string) => void;
  currentUserId: string;
}

const { width } = Dimensions.get('window');

const IoTNotificationCard: React.FC<IoTNotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onRespond,
  currentUserId,
}) => {
  const isOwnNotification = notification.estudianteID === currentUserId;
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `Hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const handleMarkAsRead = () => {
    if (!notification.leido) {
      onMarkAsRead(notification._id);
    }
  };

  const handleRespond = () => {
    Alert.alert(
      'Responder llamada',
      '¿Deseas responder a la llamada de tu tutor?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Responder',
          onPress: () => onRespond(notification._id),
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        !notification.leido && styles.unread,
        isOwnNotification && styles.ownNotification,
      ]}
      onPress={handleMarkAsRead}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons
            name={notification.respondido ? "checkmark-circle" : "call"}
            size={24}
            color={notification.respondido ? "#4CAF50" : "#FF6B35"}
          />
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>
            {notification.mensaje || "Tu tutor te está llamando"}
          </Text>
          
          <Text style={styles.details}>
            Grupo: {notification.grupoID}
          </Text>
          
          <Text style={styles.tutor}>
            Tutor: {notification.tutorID.split('@')[0]}
          </Text>
          
          <Text style={styles.time}>
            {formatDate(notification.fechaHora)}
          </Text>
        </View>

        <View style={styles.statusContainer}>
          {!notification.leido && (
            <View style={styles.unreadIndicator} />
          )}
          
          {!notification.respondido && isOwnNotification && (
            <TouchableOpacity
              style={styles.respondButton}
              onPress={handleRespond}
            >
              <Ionicons name="call" size={20} color="#4CAF50" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {notification.respondido && (
        <View style={styles.respondedIndicator}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
          <Text style={styles.respondedText}>Respondida</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#E0E0E0',
  },
  unread: {
    borderLeftColor: '#FF6B35',
    backgroundColor: '#FFF8F6',
  },
  ownNotification: {
    borderLeftColor: '#4CAF50',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  tutor: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999999',
  },
  statusContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    marginBottom: 8,
  },
  respondButton: {
    backgroundColor: '#E8F5E8',
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  respondedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  respondedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 4,
    fontWeight: '500',
  },
});

export default IoTNotificationCard; 