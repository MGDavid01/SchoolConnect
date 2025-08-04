import React, { useState, useEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, ActivityIndicator, ScrollView, TouchableOpacity, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native"; // ✅
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { RootTabParamList } from "../navigation/MainTabs";
import { MaterialIcons } from '@expo/vector-icons';
import CustomModal from "../components/CustomModal"; 
import { StackNavigationProp } from "@react-navigation/stack";
import { AuthStackParamList } from "../navigation/types";
import { CommonActions } from "@react-navigation/native";

const LoginScreen = () => {
  console.log("Componente LoginScreen montado");

 const { login } = useAuth();
  
 const navigation = useNavigation<StackNavigationProp<AuthStackParamList>>();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  //Para bloquear cuenta en caso de multiples intentos fallidos de ingreso al ingresar una CONTRASEÑA incorrrecta
  const [intentosFallidos, setIntentosFallidos] = useState(0);
  const [bloqueadoHasta, setBloqueadoHasta] = useState<Date | null>(null);
  const [cuentaInactiva, setCuentaInactiva] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [showContactButton, setShowContactButton] = useState(false);




  const handleLogin = async () => {

  if (!correo || !password) {
    setModalTitle("Campos vacios");
    setModalMessage("Por favor ingresa tu correo y contraseña");
    setModalVisible(true);
    return;
  }

  setLoading(true);
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id: correo.trim().toLowerCase(),
        password: password.trim(),
      }),
    });

    const data = await response.json();
    console.log("Respuesta del servidor:", data);

    if (!response.ok) {
      const intentos = data.intentosFallidos ?? 0;

      if (data.message?.includes("Cuenta inactiva") || data.bloqueado) {
        setCuentaInactiva(true);
        if (data.bloqueadoHasta) {
          setBloqueadoHasta(new Date(data.bloqueadoHasta));
        }
        setModalTitle("Cuenta bloqueada");
        
        setModalMessage(
          "Tu cuenta ha sido bloqueada temporalmente.\n\n" +
          `Será reactivada el ${new Date(data.bloqueadoHasta).toLocaleString()}.\n\n` +
          "Si necesitas ayuda, contacta a servicios escolares."
        );
        setShowContactButton(true);
        setModalVisible(true);
        console.log("Fecha bloqueadoHasta recibida:", data.bloqueadoHasta);
        return;
      }

      if (data.message?.includes("Contraseña incorrecta")) {
        setIntentosFallidos(intentos);

        if (intentos >= 3 && intentos < 5) {
          setModalTitle("Advertencia");
          setModalMessage(`Te quedan ${5 - intentos} intento(s) antes de que tu cuenta sea bloqueada.`);
          setModalVisible(true);
        } else if (intentos >= 5) {
          setCuentaInactiva(true);
          if (data.bloqueadoHasta) {
            setBloqueadoHasta(new Date(data.bloqueadoHasta));
          }

          setModalTitle("Cuenta bloqueada");
          setModalMessage(
            "Tu cuenta ha sido bloqueada temporalmente.\n\n" +
            `Será reactivada el ${new Date(data.bloqueadoHasta).toLocaleString()}.\n\n` +
            "Si necesitas ayuda, contacta a servicios escolares."
          );
          setShowContactButton(true);
          setModalVisible(true);
        } else {
          setModalTitle("Contraseña incorrecta");
          setModalMessage(`Intentos fallidos: ${intentos}`);
          setModalVisible(true);
        }

        return;
      }

      // Otro tipo de error
      setModalTitle("Error");
      setModalMessage(data.message || "Error de autenticación");
      setModalVisible(true);
      return;
    }

    // Si todo va bien
    const userData = {
      ...data,
      fechaRegistro: new Date(data.fechaRegistro),
      fechaNacimiento: new Date(data.fechaNacimiento),
    };

    await login(userData);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
    await AsyncStorage.setItem("correo", userData._id);
    // Verifica si es el primer inicio de sesión
    if (data.primerInicio) {
      console.log("Navegando a FirstLoginScreen")
      navigation.replace("FirstLoginScreen", { user: userData });
       return;
    } else {
      navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: "MainTabs",
            params: { screen: "Noticias" }, // 👈 importante
          },
        ],
      })
    );
    }

  } catch (error) {
    console.error("Login error:", error);
    // En caso de error de red o algo inesperado
    if (!cuentaInactiva) {
      setModalTitle("Error de conexión");
      setModalMessage("No se pudo conectar con el servidor. Verifica tu conexión.");
      setModalVisible(true);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    
    <View style={styles.container}>
      <CustomModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        showContactButton={showContactButton}
        onClose={() => {
          setModalVisible(false);
          setShowContactButton(false);
        } } children={undefined}    />


      <Image 
        source={require('../../assets/logo_sc.jpg')}  
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
        </>
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
