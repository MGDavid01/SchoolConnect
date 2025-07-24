import React, { useContext, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator, NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import NewsScreen from "../screens/NewsScreen";
import NewsDetailScreen from "../screens/NewsDetailScreen";
import BlogScreen from "../screens/BlogScreen";
import CreatePostScreen from '../screens/CreatePostScreen';
import ScholarshipScreen from "../screens/ScholarshipScreen";
import ScholarshipDetailScreen from "../screens/ScholarshipDetailScreen";
import CalendarScreen from "../screens/CalendarScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TabTransition from "../components/TabTransition";
import { COLORS } from "../theme/theme";
import { Scholarship } from '../navigation/types'; // Asegúrate de que la ruta sea correcta
import { NewsStackParamList } from './types';
import EditPostScreen from "../screens/EditPostScreen";

import RoleListScreen from "../screens/RoleListScreen";
import RolesNavigator from "./RolesNavigator";

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthContext } from "../contexts/AuthContext";


// Tipos para los parámetros de las rutas
export type RootTabParamList = {
  Noticias: undefined;
  Blog: undefined;
  Becas: undefined;
  Calendario: undefined;
  Perfil: undefined;
  RolesTab: undefined;
};

export type BlogStackParamList = {
  BlogList: undefined;
  CreatePost: undefined;
  EditPost: {
    post: BlogPost;
    onSave: (updatedPost: BlogPost) => void; // <-- AÑADIDO
  };
};

export type ScholarshipStackParamList = {
  ScholarshipList: undefined;
  ScholarshipDetail: { scholarship: Scholarship };
};


export type CalendarStackParamList = {
  CalendarMain: undefined;
};

// Justo en la parte donde defines los tipos de navegación
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditPost: {
    post: BlogPost;
    onSave: (updatedPost: BlogPost) => void;
  };
};



// Creación de los navegadores
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


const NewsNavigator: React.FC<NavigatorProps> = ({ active }) => {
  return (
            <TabTransition active={active}>
      <NewsStack.Navigator screenOptions={commonStackOptions}>
        <NewsStack.Screen name="NewsList" component={NewsScreen} />
        <NewsStack.Screen
          name="NewsDetail"
          component={NewsDetailScreen as React.FC}
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: COLORS.primary
            },
            headerTintColor: COLORS.surface,
            title: "Detalle de Noticia"
          }}
        />
      </NewsStack.Navigator>
    </TabTransition>
  );
};

import { BlogPost } from "../types/blog";


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
            headerStyle: {
              backgroundColor: COLORS.primary
            },
            headerTintColor: COLORS.surface
          }}
        />
        <BlogStack.Screen 
          name="EditPost" 
          component={EditPostScreen}
          options={{
            headerShown: true,
            headerTitle: "Editar Publicación",
            headerStyle: {
              backgroundColor: COLORS.primary
            },
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
          options={{ headerShown: false }} // Puedes cambiar esto si quieres mostrar el header
        />
        <ScholarshipStack.Screen
          name="ScholarshipDetail"
          component={ScholarshipDetailScreen}
          options={{
            headerShown: true,
            headerStyle: {
              backgroundColor: COLORS.primary
            },
            headerTintColor: COLORS.surface,
            title: "Detalle de Beca"
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
        
        {/* Agregamos EditPost aquí para que funcione desde la pestaña Perfil */}
        <ProfileStack.Screen
          name="EditPost"
          component={EditPostScreen}
          options={{
            headerShown: true,
            headerTitle: "Editar Publicación",
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.surface,
          }}
        />
      </ProfileStack.Navigator>
    </TabTransition>
  );
};


const MainTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<keyof RootTabParamList>("Noticias");
  const authContext = useContext(AuthContext);

if (!authContext) {
  throw new Error("AuthContext no disponible. Asegúrate de envolver la app con <AuthProvider>");
}

const { user } = authContext;
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.background
        },
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
        children={(props) => (
          <NewsNavigator {...props} active={activeTab === "Noticias"} />
        )}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="newspaper"
              size={size}
              color={color}
            />
          )
        }}
      />

      <Tab.Screen
        name="Blog"
        children={(props) => (
          <BlogNavigator {...props} active={activeTab === "Blog"} />
        )}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="post" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Becas"
        children={(props) => (
          <ScholarshipNavigator {...props} active={activeTab === "Becas"} />
        )}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="school" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Calendario"
        children={(props) => (
          <CalendarNavigator {...props} active={activeTab === "Calendario"} />
        )}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="Perfil"
        children={(props) => (
          <ProfileNavigator {...props} active={activeTab === "Perfil"} />
        )}
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
