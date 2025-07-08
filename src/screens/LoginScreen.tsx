import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, ActivityIndicator, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native"; // ✅
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../navigation/MainTabs";



const LoginScreen = () => {
  console.log("Componente LoginScreen montado");

 const { login } = useAuth();
  
 const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();


  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [showUsers, setShowUsers] = useState(false);

  const fetchUsers = async () => {
  try {
    setLoading(true);
    const response = await fetch(`${API_URL}/api/auth/debug/users`);
    const result = await response.json(); // ← Ahora es un objeto con {success, data}
    
    if (response.ok && result.success) {
      setUsers(result.data || []); // ← Usa result.data y fallback a array vacío
    } else {
      Alert.alert("Error", result.error || "Error en la respuesta");
    }
  } catch (error) {
    Alert.alert("Error", "Error de conexión");
    setUsers([]); // ← Asegura que siempre sea array
  } finally {
    setLoading(false);
  }
};

  // Alternar visualización de usuarios
  const toggleShowUsers = () => {
    if (!showUsers) {
      fetchUsers();
    }
    setShowUsers(!showUsers);
  };

  const testAPIConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/api/auth/test`);
    const data = await response.json();
    console.log("Respuesta del servidor:", data);
    Alert.alert("Conexión exitosa", `Servidor respondió: ${data.message}`);
  } catch (error) {
    console.error("Error de conexión:", error);
    Alert.alert("Error", "No se pudo conectar al servidor");
  }
};
  

  const handleLogin = async () => {

  if (!correo || !password) {
    Alert.alert("Campos vacíos", "Por favor ingresa tu correo y contraseña");
    return;
  }

  setLoading(true);
  try {
    console.log("Enviando login con:", correo);
    console.log("Enviando contrasena con: ", password);

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id: correo.trim().toLowerCase(),
        password: password.trim()
      }),
    });

    console.log("Status:", response.status);

     const data = await response.json();

      if (!response.ok) {
      let errorMessage = data.message;
      
      // Mensajes específicos según el código de error
      if (data.code === "CONTRASEÑA_INCORRECTA") {
        errorMessage = `Contraseña incorrecta (${data.debug.receivedLength} caracteres ingresados)`;
      }
      
      throw new Error(errorMessage);
    }
      const userData = {
      ...data,
      fechaRegistro: new Date(data.fechaRegistro),
      fechaNacimiento: new Date(data.fechaNacimiento)
    };


      console.log("Usuario logueado:", data);
      // Guardamos el usuario en contexto (y en AsyncStorage desde login())
      await login(data);

      console.log("Redirigiendo a Home...");
      await AsyncStorage.setItem("user", JSON.stringify(data));
      login(data);
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
        <>
          <Button title="Ingresar" onPress={handleLogin} />
          <Button 
            title="Probar conexión" 
            onPress={testAPIConnection} 
            color="#888"
          />
          <Button 
            title={showUsers ? "Ocultar usuarios" : "Mostrar usuarios"} 
            onPress={toggleShowUsers} 
            color="#666"
          />
        </>
      )}

      {showUsers && (
  <ScrollView style={styles.usersContainer}>
    <Text style={styles.usersTitle}>
      Usuarios en la base de datos ({Array.isArray(users) ? users.length : 0})
    </Text>
    
    {/* Validación adicional */}
    {Array.isArray(users) ? (
      users.map((user, index) => (
        <View key={`user-${index}`} style={styles.userCard}>
          <Text>Email: {user._id}</Text>
          <Text>Nombre: {user.nombre}</Text>
          <Text>Rol: {user.rol}</Text>
        </View>
      ))
    ) : (
      <Text>Formato de datos inesperado</Text>
    )}
  </ScrollView>
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
  usersContainer: {
    marginTop: 20,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  usersTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
    marginBottom: 5,
  },
});
