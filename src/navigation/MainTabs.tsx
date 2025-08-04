import React, { useContext, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RouteProp, useRoute } from "@react-navigation/native";
import { CompositeScreenProps } from "@react-navigation/native";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

// Screens
import NewsScreen from "../screens/NewsScreen";
import NewsDetailScreen from "../screens/NewsDetailScreen";
import BlogScreen from "../screens/BlogScreen";
import CreatePostScreen from '../screens/CreatePostScreen';
import ScholarshipScreen from "../screens/ScholarshipScreen";
import ScholarshipDetailScreen from "../screens/ScholarshipDetailScreen";
import CalendarScreen from "../screens/CalendarScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EditPostScreen from "../screens/EditPostScreen";

// Components
import TabTransition from "../components/TabTransition";

// Types and Context
import { COLORS } from "../theme/theme";
import { Scholarship } from '../navigation/types';
import { BlogPost } from "../types/blog";
import { AuthContext } from "../contexts/AuthContext";

// Definición de tipos
export type RootTabParamList = {
  Noticias: undefined;
  Blog: undefined;
  Becas: undefined;
  Calendario: undefined;
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
            headerShown: true,
            headerTitle: "Nueva Publicación",
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.surface
          }}
        />
        <BlogStack.Screen 
          name="EditPost" 
          component={EditPostScreen}
          options={{
            headerShown: true,
            headerTitle: "Editar Publicación",
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.surface
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

const ProfileNavigator: React.FC<NavigatorProps> = ({ active }) => {
  return (
    <TabTransition active={active}>
      <ProfileStack.Navigator screenOptions={commonStackOptions}>
        <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
        <ProfileStack.Screen
          name="EditPost"
          component={EditPostScreen}
          options={{
            headerShown: true,
            headerTitle: "Editar Publicación",
            headerStyle: { backgroundColor: COLORS.primary },
            headerTintColor: COLORS.surface,
          }}
        />
      </ProfileStack.Navigator>
    </TabTransition>
  );
};

// Tipos para MainTabs
type MainTabsProps = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;

const MainTabs: React.FC<MainTabsProps> = ({ route }) => {
  const [activeTab, setActiveTab] = useState<keyof RootTabParamList>("Noticias");
  const { user } = useContext(AuthContext) || {};

  if (!user) {
    throw new Error("Usuario no autenticado. Asegúrate de que el usuario esté logueado.");
  }

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
      <Tab.Screen
        name="Becas"
        children={(props) => <ScholarshipNavigator {...props} active={activeTab === "Becas"} />}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="school" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Calendario"
        children={(props) => <CalendarNavigator {...props} active={activeTab === "Calendario"} />}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          )
        }}
      />
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

export default MainTabs;