import React, { useState } from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import NewsScreen from "../screens/NewsScreen"
import NewsDetailScreen from "../screens/NewsDetailScreen"
import BlogScreen from "../screens/BlogScreen"
import CreatePostScreen from '../screens/CreatePostScreen'
import ScholarshipScreen from "../screens/ScholarshipScreen"
import ScholarshipDetailScreen from "../screens/ScholarshipDetailScreen"
import CalendarScreen from "../screens/CalendarScreen"
import ProfileScreen from "../screens/ProfileScreen"
import TabTransition from "../components/TabTransition"
import { COLORS } from "../theme/theme"

const Tab = createBottomTabNavigator()
const NewsStack = createNativeStackNavigator()
const BlogStack = createNativeStackNavigator()
const CreatePostStack = createNativeStackNavigator()
const ScholarshipStack = createNativeStackNavigator()
const CalendarStack = createNativeStackNavigator()
const ProfileStack = createNativeStackNavigator()


const NewsNavigator = ({ active }) => {
  return (
    <TabTransition active={active}>
      <NewsStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 200
        }}
      >
        <NewsStack.Screen name="NewsList" component={NewsScreen} />
        <NewsStack.Screen
          name="NewsDetail"
          component={NewsDetailScreen}
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
  )
}

const BlogNavigator = ({ active }) => {
  return (
    <TabTransition active={active}>
      <BlogStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 200
        }}
      >
        <BlogStack.Screen name="BlogList" component={BlogScreen} />
        <BlogStack.Screen name="CreatePost" component={CreatePostScreen} />
      </BlogStack.Navigator>
    </TabTransition>
  )
}

const ScholarshipNavigator = ({ active }) => {
  return (
    <TabTransition active={active}>
      <ScholarshipStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 200
        }}
      >
        <ScholarshipStack.Screen
          name="ScholarshipList"
          component={ScholarshipScreen}
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
  )
}

const CalendarNavigator = ({ active }) => {
  return (
    <TabTransition active={active}>
      <CalendarStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 200
        }}
      >
        <CalendarStack.Screen name="CalendarMain" component={CalendarScreen} />
      </CalendarStack.Navigator>
    </TabTransition>
  )
}

const ProfileNavigator = ({ active }) => {
  return (
    <TabTransition active={active}>
      <ProfileStack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 200
        }}
      >
        <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
      </ProfileStack.Navigator>
    </TabTransition>
  )
}

export const MainNavigator = () => {
  const [activeTab, setActiveTab] = useState("Noticias")

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
        state: e => {
          const routes = e.data.state?.routes
          const index = e.data.state?.index
          if (routes && typeof index === "number") {
            setActiveTab(routes[index].name)
          }
        }
      }}
    >
      <Tab.Screen
        name="Noticias"
        children={props => (
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
        children={props => (
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
        children={props => (
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
        children={props => (
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
        children={props => (
          <ProfileNavigator {...props} active={activeTab === "Perfil"} />
        )}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  )
}
