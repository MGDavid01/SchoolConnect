import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthContext } from "../contexts/AuthContext";
import AuthStack from "./AuthStack";
import MainTabs from "./MainTabs";

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};


const AppNavigator = () => {
const Stack = createNativeStackNavigator<RootStackParamList>();
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext no disponible. Asegúrate de envolver la app con <AuthProvider>");
  }

  const { user } = authContext;

  return (

      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>

  );
};

export default AppNavigator;
