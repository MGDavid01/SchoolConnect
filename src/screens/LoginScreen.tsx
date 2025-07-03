import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native"; // ✅
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../navigation/MainTabs";

  

const LoginScreen = () => {
 const { setUser } = useAuth();
  
 const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();


  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  

  const handleLogin = async () => {

  if (!correo || !password) {
    Alert.alert("Campos vacíos", "Por favor ingresa tu correo y contraseña");
    return;
  }

  setLoading(true);
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo: correo.trim().toLowerCase(),
        password,
      }),
    });

    console.log("Status:", response.status);

    if (!response.ok) {
      const errorData = await response.json();
      Alert.alert("Error", errorData.message || "Credenciales incorrectas");
      return;
    }

    const data = await response.json();
    await AsyncStorage.setItem("user", JSON.stringify(data));
    setUser(data);
    navigation.navigate("Perfil");
  } catch (error) {
    Alert.alert("Error de conexión", "No se pudo conectar al servidor.");
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Iniciar Sesión</Text>
      <TextInput
        placeholder="Correo"
        style={styles.input}
        value={correo}
        onChangeText={setCorreo}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        placeholder="Contraseña"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Ingresar" onPress={handleLogin} />
      )}
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: "center" },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    padding: 8,
  },
});
