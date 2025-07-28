// src/navigation/IoTNotificationsExample.tsx
// Este archivo muestra cómo integrar las notificaciones IoT en la navegación existente

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import IoTNotificationsScreen from '../screens/IoTNotificationsScreen';
import { COLORS } from '../theme/theme';

// Tipos para la navegación de notificaciones IoT
export type IoTNotificationsStackParamList = {
  IoTNotificationsMain: undefined;
  IoTNotificationDetail: { notificationId: string };
};

const IoTStack = createNativeStackNavigator<IoTNotificationsStackParamList>();

// Navegador para las notificaciones IoT
const IoTNotificationsNavigator: React.FC = () => {
  return (
    <IoTStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <IoTStack.Screen
        name="IoTNotificationsMain"
        component={IoTNotificationsScreen}
        options={{
          title: 'Notificaciones IoT',
          headerShown: true,
        }}
      />
    </IoTStack.Navigator>
  );
};

export default IoTNotificationsNavigator;

// Ejemplo de cómo agregar el badge de notificaciones a un tab existente:
/*
import NotificationBadge from '../components/NotificationBadge';
import { useIoTNotifications } from '../hooks/useIoTNotifications';

// En tu componente de tab:
const { unreadCount } = useIoTNotifications();

<Tab.Screen
  name="Notificaciones"
  component={IoTNotificationsNavigator}
  options={{
    tabBarIcon: ({ color, size }) => (
      <View>
        <MaterialCommunityIcons name="bell" size={size} color={color} />
        <NotificationBadge count={unreadCount} size="small" />
      </View>
    ),
    tabBarLabel: 'Notificaciones',
  }}
/>
*/

// Ejemplo de cómo agregar un botón de notificaciones en el header:
/*
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NotificationBadge from '../components/NotificationBadge';

// En las opciones de la pantalla:
options={{
  headerRight: () => (
    <TouchableOpacity
      onPress={() => navigation.navigate('IoTNotifications')}
      style={{ marginRight: 15 }}
    >
      <View>
        <Ionicons name="notifications" size={24} color={COLORS.surface} />
        <NotificationBadge count={unreadCount} size="small" />
      </View>
    </TouchableOpacity>
  ),
}}
*/ 