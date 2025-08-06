import React, { useContext, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
// Screens
import NewsScreen from "../screens/NewsScreen";
import NewsDetailScreen from "../screens/NewsDetailScreen";
import BlogScreen from "../screens/BlogScreen";
import CreatePostScreen from '../screens/CreatePostScreen';
import ScholarshipScreen from "../screens/ScholarshipScreen";
import ScholarshipDetailScreen from "../screens/ScholarshipDetailScreen";
import CalendarScreen from "../screens/CalendarScreen";
import ProfileScreen from "../screens/ProfileScreen";
import IoTNotificationsScreen from "../screens/IoTNotificationsScreen";
import TabTransition from "../components/TabTransition";
import { COLORS } from "../theme/theme";
import { MainTabsProps, Scholarship } from '../navigation/types'; // Asegúrate de que la ruta sea correcta

import EditPostScreen from "../screens/EditPostScreen";
import { usePendingNotifications } from "../hooks/usePendingNotifications";

// Components

import { BlogPost } from "../types/blog";
import { AuthContext, useAuth } from "../contexts/AuthContext";

// Definición de tipos
export type RootTabParamList = {
  Noticias: undefined;
  Blog: undefined;
  Becas: undefined;
  Calendario: undefined;
  IoT: undefined;
  Perfil: undefined;
  RolesTab: undefined;
};

export type NewsStackParamList = {
  NewsList: undefined;
  NewsDetail: { post: any }; // Ajusta este tipo según tu estructura de datos
};

export type BlogStackParamList = {
  BlogList: undefined;
  CreatePost: undefined;
  EditPost: {
    post: BlogPost;
    onSave: (updatedPost: BlogPost) => void;
  };
};

export type ScholarshipStackParamList = {
  ScholarshipList: undefined;
  ScholarshipDetail: { scholarship: Scholarship };
};




export type CalendarStackParamList = {
  CalendarMain: undefined;
};

export type IoTStackParamList = {
  IoTMain: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditPost: {
    post: BlogPost;
    onSave: (updatedPost: BlogPost) => void;
  };
};

export type RootStackParamList = {
  MainTabs: { screen?: keyof RootTabParamList };
  // Otras rutas...
};

// Creación de navegadores
const Tab = createBottomTabNavigator<RootTabParamList>();
const NewsStack = createNativeStackNavigator<NewsStackParamList>();
const BlogStack = createNativeStackNavigator<BlogStackParamList>();
const ScholarshipStack = createNativeStackNavigator<ScholarshipStackParamList>();
const CalendarStack = createNativeStackNavigator<CalendarStackParamList>();
const IoTStack = createNativeStackNavigator<IoTStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// Props para los componentes de navegación
interface NavigatorProps {
  active: boolean;
}

const commonStackOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: "fade",
  animationDuration: 200
};

// Componentes de navegación
const NewsNavigator: React.FC<NavigatorProps> = ({ active }) => {
  return (
    <TabTransition active={active}>
      <NewsStack.Navigator screenOptions={commonStackOptions}>
        <NewsStack.Screen name="NewsList" component={NewsScreen} />
        <NewsStack.Screen 
          name="NewsDetail" 
          component={NewsDetailScreen as React.ComponentType<any>}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.surface,
            title: "Detalle de Noticia"
          }}
        />
      </NewsStack.Navigator>
    </TabTransition>
  );
};

const BlogNavigator: React.FC<NavigatorProps> = ({ active }) => {
  return (
    <TabTransition active={active}>
      <BlogStack.Navigator screenOptions={commonStackOptions}>
        <BlogStack.Screen name="BlogList" component={BlogScreen} />
        <BlogStack.Screen 
          name="CreatePost" 
          component={CreatePostScreen} 
          options={{
            headerShown: false
          }}
        />
        <BlogStack.Screen 
          name="EditPost" 
          component={EditPostScreen}
          options={{
            headerShown: false
          }}
        />
      </BlogStack.Navigator>
    </TabTransition>
  );
};

const ScholarshipNavigator: React.FC<NavigatorProps> = ({ active }) => {
  return (
    <TabTransition active={active}>
      <ScholarshipStack.Navigator screenOptions={commonStackOptions}>
        <ScholarshipStack.Screen
          name="ScholarshipList"
          component={ScholarshipScreen}
        />
        <ScholarshipStack.Screen
          name="ScholarshipDetail"
          component={ScholarshipDetailScreen as React.ComponentType<any>}
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.surface,
            title: "Detalles del Apoyo"
          }}
        />
      </ScholarshipStack.Navigator>
    </TabTransition>
  );
};

const CalendarNavigator: React.FC<NavigatorProps> = ({ active }) => {
  return (
    <TabTransition active={active}>
      <CalendarStack.Navigator screenOptions={commonStackOptions}>
        <CalendarStack.Screen name="CalendarMain" component={CalendarScreen} />
      </CalendarStack.Navigator>
    </TabTransition>
  );
};

const IoTNavigator: React.FC<NavigatorProps> = ({ active }) => {
  return (
    <TabTransition active={active}>
      <IoTStack.Navigator screenOptions={commonStackOptions}>
        <IoTStack.Screen name="IoTMain" component={IoTNotificationsScreen} />
      </IoTStack.Navigator>
    </TabTransition>
  );
};

const ProfileNavigator: React.FC<NavigatorProps> = ({ active }) => {
  return (
    <TabTransition active={active}>
      <ProfileStack.Navigator screenOptions={commonStackOptions}>
        <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
        <ProfileStack.Screen
          name="EditPost"
          component={EditPostScreen}
          options={{
            headerShown: false
          }}
        />
      </ProfileStack.Navigator>
    </TabTransition>
  );
};

// Componente para el badge de notificaciones
const NotificationBadge: React.FC<{ count: number }> = ({ count }) => {
  if (count === 0) return null;
  
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>
        {count > 99 ? '99+' : count.toString()}
      </Text>
    </View>
  );
};

// Componente para el icono del tab con badge
const NotificationTabIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => {
  const { pendingCount } = usePendingNotifications();
  
  return (
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons name="bell-ring" size={size} color={color} />
      <NotificationBadge count={pendingCount} />
    </View>
  );
};


const MainTabs: React.FC<MainTabsProps> = ({ route }) => {
  const [activeTab, setActiveTab] = useState<keyof RootTabParamList>("Noticias");
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const rol = user.rol?.toLowerCase(); // Esto asegura que sea "alumno", "docente", etc.
  console.log("ROL DETECTADO:", rol);

  const initialRoute = route.params?.screen || "Noticias";

  return (
    <Tab.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.secondary,
        headerShown: false,
        tabBarStyle: { backgroundColor: COLORS.surface },
        tabBarHideOnKeyboard: true
      }}
      screenListeners={{
        state: (e) => {
          const routes = e.data.state?.routes;
          const index = e.data.state?.index;
          if (routes && typeof index === "number") {
            setActiveTab(routes[index].name as keyof RootTabParamList);
          }
        }
      }}
    >
      <Tab.Screen
        name="Noticias"
        children={(props) => <NewsNavigator {...props} active={activeTab === "Noticias"} />}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="newspaper" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Blog"
        children={(props) => <BlogNavigator {...props} active={activeTab === "Blog"} />}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="post" size={size} color={color} />
          )
        }}
      />
      {user.rol === "alumno" && (
        <Tab.Screen
          name="Becas"
          children={(props) => <ScholarshipNavigator {...props} active={activeTab === "Becas"} />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="school" size={size} color={color} />
            )
          }}
        />
      )}
      {user.rol === "alumno" && (
        <Tab.Screen
          name="Calendario"
          children={(props) => <CalendarNavigator {...props} active={activeTab === "Calendario"} />}
          options={{
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar" size={size} color={color} />
            )
          }}
        />
      )}
      {user.rol === "alumno" && (
        <Tab.Screen
          name="IoT"
          children={(props) => (
            <IoTNavigator {...props} active={activeTab === "IoT"} />
          )}
          options={{
            tabBarIcon: ({ color, size }) => (
              <NotificationTabIcon color={color} size={size} />
            ),
            tabBarLabel: "Notificaciones"
          }}
        />
      )}
      <Tab.Screen
        name="Perfil"
        children={(props) => <ProfileNavigator {...props} active={activeTab === "Perfil"} />}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    flex: 1,
    position: 'relative',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.surface,
    zIndex: 1,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
  },
});

export default MainTabs;
