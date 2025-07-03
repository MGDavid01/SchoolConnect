import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { Provider as PaperProvider } from "react-native-paper";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext"; // Importa useAuth correctamente
import { ActivityIndicator, View } from "react-native";
import MainNavigator from "./src/navigation/MainNavigator";

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
  const { user, isLoading } = useAuth(); // Ahora está correctamente importado

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return <MainNavigator />;
};

export default App;