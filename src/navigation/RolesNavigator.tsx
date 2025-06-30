import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import RoleListScreen from "../screens/RoleListScreen";
import { NativeStackNavigationOptions } from "@react-navigation/native-stack";
import { COLORS } from "../theme/theme"; // Si usas tus colores definidos

const Stack = createNativeStackNavigator();

const commonStackOptions: NativeStackNavigationOptions = {
  headerShown: true,
  animation: "fade",
  animationDuration: 200,
  headerStyle: {
    backgroundColor: COLORS.primary
  },
  headerTintColor: COLORS.surface
};

const RolesNavigator: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <Stack.Navigator screenOptions={commonStackOptions}>
      <Stack.Screen
        name="RolesList"
        component={RoleListScreen}
        options={{ title: "Lista de Roles" }}
      />
    </Stack.Navigator>
  );
};

export default RolesNavigator;
