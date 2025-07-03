import React from "react";
import { useAuth } from "../contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";
import { NavigationContainer } from "@react-navigation/native";

export const MainNavigator: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <ActivityIndicator size="large" />;
  }

  return user ? <MainTabs /> : <AuthStack />; // <- Sin NavigationContainer aquí
};

export default MainNavigator;