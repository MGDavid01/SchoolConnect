import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from "react-native";
import { API_URL } from "../constants/api";
import axios from "axios";
import { CommonActions, RouteProp, useRoute } from "@react-navigation/native";
import { AuthStackParamList } from "../navigation/types"; 
import { RootStackParamList } from "../navigation/MainNavigator";
import { User } from "../navigation/types";
import { useAuth } from "../contexts/AuthContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { MaterialIcons } from "@expo/vector-icons";

type FirstLoginScreenRouteProp = RouteProp<RootStackParamList, "FirstLoginScreen">;

type Props = {
  route: RouteProp<RootStackParamList, "FirstLoginScreen">;
  navigation: any;
};


const FirstLoginScreen = ({ route, navigation }: Props) => {
  const { user } = route.params;
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const {setUser} = useAuth();
  const [showPassword, setShowPassword] = useState(false);

const handlePasswordChange = async () => {
  if (!newPassword.trim() || !currentPassword.trim()) {
    Alert.alert("Campos requeridos", "Por favor, llena ambos campos.");
    return;
  }

  setLoading(true);
  try {
    // 1. Cambiar contraseña en el backend
    await axios.post(`${API_URL}/api/users/change-password`, {
      userId: user._id,
      currentPassword,
      newPassword,
    });

    // 2. Actualizar estado del usuario
    const updatedUser = {
      ...user,
      primerInicio: false,
    };

    // 3. Persistir cambios localmente
    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);

    // 4. Reiniciar completamente la navegación
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      })
    );

  } catch (err) {
    console.error("Error al cambiar contraseña", err);
    Alert.alert("Error No se pudo cambiar la contraseña. Verifica la actual");
  } finally {
    setLoading(false);
  }
};


  const handleSkip = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/users/mark-first-login-complete`, {
        userId: user._id,
      });

      const updatedUser = {
        ...user,
        primerInicio: false,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });

    } catch (error) {
      console.error("Error al marcar primer inicio como completado", error);
      Alert.alert("Error", "No se pudo completar el proceso. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <View style={styles.container}>
 <Text style={styles.title}>Bienvenido, {user.nombre}</Text>
    <Text style={styles.subtitle}>Es tu primer inicio de sesión. Por favor, cambia tu contraseña.</Text>

    <TextInput
      placeholder="Contraseña actual"
      placeholderTextColor="#4A4A4A"
      style={styles.input}
      value={currentPassword}
      onChangeText={setCurrentPassword}
      secureTextEntry
    />

    <View style={styles.inputContainer}>
      <TextInput
        placeholder="Nueva contraseña"
        placeholderTextColor="#4A4A4A"
        style={styles.inputField}
        value={newPassword}
        onChangeText={setNewPassword}
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
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handlePasswordChange}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>Guardar y continuar</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton} 
          onPress={handleSkip}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Omitir por ahora</Text>
        </TouchableOpacity>
      </>
    )}
  </View>
);
};

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
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 22,
  },
  input: {
    backgroundColor: '#EDEDED',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    color: '#000000',
  },
  inputContainer: {
    backgroundColor: '#EDEDED',
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
  loginButton: {
    backgroundColor: '#7A1625',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7A1625',
  },
  secondaryButtonText: {
    color: '#7A1625',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default FirstLoginScreen;
