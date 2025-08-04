import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import AuthStack from "./AuthStack";
import MainTabs, { RootTabParamList } from "./MainTabs";
import { NavigationContainer } from "@react-navigation/native";
import FirstLoginScreen from "../screens/FirstLoginScreen";
import { MainRouter } from "./MainRouter"
import { createNativeStackNavigator } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Router: undefined;
  AuthStack: undefined;
   MainTabs: { screen?: keyof RootTabParamList };
  FirstLoginScreen: { user: any }; 
};



export const MainNavigator = () => {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  return (

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Router" component={MainRouter} />
        <Stack.Screen name="AuthStack" component={AuthStack} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="FirstLoginScreen" component={FirstLoginScreen} />
      </Stack.Navigator>

  );
};
