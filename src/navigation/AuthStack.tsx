import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import { AuthStackParamList } from "../navigation/types";
import FirstLoginScreen from "../screens/FirstLoginScreen";


const AuthStack = () => {
  const Stack = createNativeStackNavigator<AuthStackParamList>();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="FirstLoginScreen" component={FirstLoginScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
