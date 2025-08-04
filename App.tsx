import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";
import { ActivityIndicator, View } from "react-native";
import { MainNavigator } from "./src/navigation/MainNavigator";
import AuthStack from "./src/navigation/AuthStack";
import FirstLoginScreen from "./src/screens/FirstLoginScreen";

const App = () => {
  return (
    <PaperProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </AuthProvider>
    </PaperProvider>
  );
};

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user) {
    return <AuthStack />;
  }

  return <MainNavigator />;
};

export default App;
