// MainRouter.tsx
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "./MainNavigator";
import { CommonActions } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

type MainRouterProps = {
  navigation: StackNavigationProp<RootStackParamList, keyof RootStackParamList>;
};

export const MainRouter: React.FC<MainRouterProps> = ({ navigation }) => {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    const resetNavigation = async () => {
      try {
        // Espera un breve momento para asegurar que la navegación esté lista
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (!user) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "Auth" }],
            })
          );
        } else if (user.primerInicio) {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: "FirstLoginScreen", params: { user } }],
            })
          );
        } else {
          // Opción más confiable usando navigate en lugar de reset
          navigation.dispatch(
            CommonActions.navigate({
              name: "MainTabs",
              params: {
                screen: "Noticias", // Cambia esto según necesites
              },
            })
          );
        }
      } catch (error) {
        console.error("Error en navegación:", error);
      }
    };

    resetNavigation();
  }, [user, isLoading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
};
