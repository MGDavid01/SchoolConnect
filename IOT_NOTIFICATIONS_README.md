# Sistema de Notificaciones IoT para SchoolConnect

## Descripción

Este sistema permite que los dispositivos IoT envíen notificaciones a estudiantes específicos cuando un tutor los necesita. El sistema incluye:

- **Backend**: API REST para manejar notificaciones IoT
- **Frontend**: Interfaz móvil para ver y responder notificaciones
- **Notificaciones Push**: Sistema de notificaciones en tiempo real
- **Base de Datos**: Colección MongoDB para almacenar notificaciones

## Estructura de la Base de Datos

### Colección: `llamadoIoT`

```javascript
{
  _id: "iot_001",
  grupoID: "dsm_5a_1",
  estudianteID: "juan.perez@escuela.mx",
  tutorID: "carlos.mendoza@escuela.mx",
  fechaHora: "2025-01-15T10:30:00.000Z",
  leido: false,
  respondido: false,
  mensaje: "Tu tutor te está llamando"
}
```

## Instalación y Configuración

### 1. Dependencias

Asegúrate de tener instaladas las siguientes dependencias:

```bash
npm install expo-notifications
npm install @expo/vector-icons
```

### 2. Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
MONGO_URI=tu_uri_de_mongodb
EXPO_PROJECT_ID=tu_expo_project_id
```

### 3. Insertar Datos de Prueba

Ejecuta el script para insertar datos de prueba:

```bash
node src/scripts/insertIoTData.js
```

## API Endpoints

### Notificaciones IoT

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/iot-notifications/student/:estudianteID` | Obtener notificaciones de un estudiante |
| GET | `/api/iot-notifications/group/:grupoID` | Obtener notificaciones por grupo |
| PATCH | `/api/iot-notifications/:id/read` | Marcar como leída |
| PATCH | `/api/iot-notifications/:id/respond` | Marcar como respondida |
| POST | `/api/iot-notifications/create` | Crear nueva notificación |
| GET | `/api/iot-notifications/stats/:estudianteID` | Obtener estadísticas |
| DELETE | `/api/iot-notifications/:id` | Eliminar notificación |

### Ejemplos de Uso

#### Crear una notificación IoT

```javascript
// Cuando el dispositivo IoT envía datos
const response = await fetch('http://localhost:4000/api/iot-notifications/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    grupoID: "dsm_5a_1",
    estudianteID: "juan.perez@escuela.mx",
    tutorID: "carlos.mendoza@escuela.mx",
    mensaje: "Tu tutor te está llamando"
  })
});
```

#### Obtener notificaciones de un estudiante

```javascript
const response = await fetch('http://localhost:4000/api/iot-notifications/student/juan.perez@escuela.mx');
const data = await response.json();
```

## Componentes de la Aplicación Móvil

### 1. IoTNotificationCard

Componente para mostrar una notificación individual:

```jsx
import IoTNotificationCard from '../components/IoTNotificationCard';

<IoTNotificationCard
  notification={notification}
  onMarkAsRead={markAsRead}
  onRespond={respondToNotification}
  currentUserId={user._id}
/>
```

### 2. IoTNotificationsScreen

Pantalla principal para mostrar todas las notificaciones:

```jsx
import IoTNotificationsScreen from '../screens/IoTNotificationsScreen';

// En tu navegador
<Stack.Screen name="IoTNotifications" component={IoTNotificationsScreen} />
```

### 3. NotificationBadge

Badge para mostrar el número de notificaciones no leídas:

```jsx
import NotificationBadge from '../components/NotificationBadge';

<View>
  <Icon name="notifications" />
  <NotificationBadge count={unreadCount} />
</View>
```

## Hook Personalizado

### useIoTNotifications

Hook para manejar el estado de las notificaciones:

```jsx
import { useIoTNotifications } from '../hooks/useIoTNotifications';

const {
  notifications,
  stats,
  loading,
  unreadCount,
  markAsRead,
  respondToNotification
} = useIoTNotifications();
```

## Servicio de Notificaciones

### notificationService

Servicio para manejar notificaciones push:

```jsx
import { notificationService } from '../utils/notificationService';

// Solicitar permisos
await notificationService.requestPermissions();

// Enviar notificación local
await notificationService.sendLocalNotification({
  title: "Llamada de Tutor",
  body: "Tu tutor te está llamando"
});
```

## Flujo de Trabajo

### 1. Dispositivo IoT envía datos
```javascript
// El dispositivo IoT envía una petición POST al endpoint
POST /api/iot-notifications/create
{
  "grupoID": "dsm_5a_1",
  "estudianteID": "juan.perez@escuela.mx",
  "tutorID": "carlos.mendoza@escuela.mx"
}
```

### 2. Servidor crea la notificación
- Valida que el estudiante y tutor existen
- Crea el registro en la base de datos
- Envía notificación push al estudiante

### 3. Aplicación móvil recibe la notificación
- El estudiante recibe una notificación push
- La app muestra la notificación en la pantalla
- El estudiante puede responder o marcar como leída

### 4. Respuesta del estudiante
- El estudiante toca "Responder"
- Se actualiza el estado en la base de datos
- Se envía confirmación al tutor

## Características

### ✅ Implementado
- [x] Modelo de datos para notificaciones IoT
- [x] API REST completa
- [x] Componentes de UI para la app móvil
- [x] Sistema de notificaciones push
- [x] Hook personalizado para estado
- [x] Badge para notificaciones no leídas
- [x] Estadísticas de notificaciones
- [x] Filtros (todas/sin leer)
- [x] Datos de prueba

### 🔄 En Desarrollo
- [ ] Integración con WebSockets para tiempo real
- [ ] Notificaciones push a través de Firebase
- [ ] Historial de notificaciones
- [ ] Configuración de preferencias

### 📋 Pendiente
- [ ] Dashboard para tutores
- [ ] Reportes de notificaciones
- [ ] Integración con calendario
- [ ] Notificaciones programadas

## Troubleshooting

### Problemas Comunes

1. **Notificaciones no aparecen**
   - Verificar permisos de notificación
   - Comprobar conexión a internet
   - Revisar logs del servidor

2. **Error de conexión a MongoDB**
   - Verificar MONGO_URI en .env
   - Comprobar conexión a internet
   - Revisar configuración de red

3. **Notificaciones push no funcionan**
   - Verificar EXPO_PROJECT_ID
   - Comprobar configuración de Expo
   - Revisar tokens de notificación

## Contribución

Para contribuir al proyecto:

1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa los cambios
4. Añade tests si es necesario
5. Envía un pull request

## Licencia

Este proyecto está bajo la licencia MIT. 