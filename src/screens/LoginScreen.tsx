import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native"; // ✅
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../navigation/MainTabs";
import { MaterialIcons } from '@expo/vector-icons';


const LoginScreen = () => {
  console.log("Componente LoginScreen montado");

 const { login } = useAuth();
  
 const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();


  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      await AsyncStorage.setItem("correo", data._id);
      const storedCorreo = await AsyncStorage.getItem("correo");
      console.log("✅ Correo guardado en AsyncStorage:", storedCorreo);
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

      <Image 
        source={require('../../assets/logo_sc.jpg')}  // o la ruta de tu imagen
        style={styles.logo}
      />

      <Text style={styles.title}>Iniciar Sesión</Text>
      <Text style={styles.subtitle}>Ingrese su email y contraseña</Text>
      
      <TextInput
        placeholder="Correo"
        placeholderTextColor="#4A4A4A"
        style={styles.input}
        value={correo}
        onChangeText={setCorreo}
      />

    <View style={styles.inputContainer}>
  <TextInput
    placeholder="Contraseña"
    placeholderTextColor="#4A4A4A"
    style={styles.inputField}
    value={password}
    onChangeText={setPassword}
    secureTextEntry={!showPassword}
  />
  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
    <MaterialIcons
      name={showPassword ? 'visibility' : 'visibility-off'}
      size={24}
      color="#4A4A4A"
    />
  </TouchableOpacity>
</View>


      
     {loading ? (
        <ActivityIndicator size="large" color="#7A1625" />
      ) : (
        <>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Ingresar</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.secondaryButton} onPress={testAPIConnection}>
            <Text style={styles.secondaryButtonText}>Probar conexión</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryButton} onPress={toggleShowUsers}>
            <Text style={styles.secondaryButtonText}>
              {showUsers ? 'Ocultar usuarios' : 'Mostrar usuarios'}
            </Text>
          </TouchableOpacity> */}
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
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    justifyContent: 'center',
    padding: 25,
  },
    logo: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#7A1625',
    marginBottom: 30,
    textAlign: 'center',
  },
    subtitle: {
    fontSize: 18,
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#EDEDED',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#000000',
  },
  loginButton: {
    backgroundColor: '#7A1625',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#B78E4A',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  usersContainer: {
    marginTop: 25,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#EDEDED',
  },
  usersTitle: {
    fontWeight: 'bold',
    color: '#7A1625',
    marginBottom: 10,
    fontSize: 16,
  },
  userCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingVertical: 6,
    marginBottom: 4,
  },
  userText: {
    color: '#4A4A4A',
    fontSize: 14,
  },

inputContainer: {
  backgroundColor: '#E6F0FF',
  borderRadius: 8,
  paddingHorizontal: 15,
  paddingVertical: 10,
  marginBottom: 15,
  flexDirection: 'row',
  alignItems: 'center',
},

inputField: {
  flex: 1,
  fontSize: 16,
  color: '#000000',
},

iconContainer: {
  marginLeft: 10,
},

});
