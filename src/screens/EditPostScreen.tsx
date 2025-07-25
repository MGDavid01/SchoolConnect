import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";
import { Menu } from "react-native-paper";
import { BlogStackParamList } from "../navigation/types";
import { COLORS } from "../theme/theme";
import axios from "axios";
import { API_URL } from "../constants/api";
import { useAuth } from "../contexts/AuthContext";

const EditPostScreen = () => {
  const route = useRoute<RouteProp<BlogStackParamList, "EditPost">>();
  const navigation = useNavigation();
  const { post } = route.params;
  const { user } = useAuth();

  const [contenido, setContenido] = useState(post.content);
  const [tipo, setTipo] = useState<"normal" | "ayuda" | "pregunta" | "aviso">(
    (post.tipo as any) || "normal"
  );
  const [visibilidad, setVisibilidad] = useState<"todos" | "grupo">(
    (post.categoria as "todos" | "grupo") || "todos"
  );
  const [tipoMenuVisible, setTipoMenuVisible] = useState(false);
  const [visibilidadMenuVisible, setVisibilidadMenuVisible] = useState(false);

  const buttonScale = new Animated.Value(1);

  const handleGuardarCambios = async () => {
    try {
      await axios.patch(`${API_URL}/api/publicaciones/${post.id}`, {
        contenido,
        tipo,
        visibilidad,
        userID: user?._id,
      });
      navigation.goBack();
    } catch (error) {
      console.error("Error al actualizar publicación:", error);
    }
  };

  const animateButton = (to: number) => {
    Animated.timing(buttonScale, {
      toValue: to,
      duration: 120,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView contentContainerStyle={styles.formContainer}>
        <Text style={styles.title}>Editar Publicación</Text>

        {/* Selector de tipo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo de publicación</Text>
          <Menu
            visible={tipoMenuVisible}
            onDismiss={() => setTipoMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setTipoMenuVisible(true)}
              >
                <Text style={styles.selectorText}>
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </Text>
              </TouchableOpacity>
            }
          >
            {["normal", "ayuda", "pregunta", "aviso"].map((item) => (
              <Menu.Item
                key={item}
                onPress={() => {
                  setTipo(item as any);
                  setTipoMenuVisible(false);
                }}
                title={item.charAt(0).toUpperCase() + item.slice(1)}
              />
            ))}
          </Menu>
        </View>

        {/* Selector de visibilidad */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Visibilidad</Text>
          <Menu
            visible={visibilidadMenuVisible}
            onDismiss={() => setVisibilidadMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.selector}
                onPress={() => setVisibilidadMenuVisible(true)}
              >
                <Text style={styles.selectorText}>
                  {visibilidad === "grupo" ? "Solo grupo" : "Todos"}
                </Text>
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                setVisibilidad("todos");
                setVisibilidadMenuVisible(false);
              }}
              title="Todos"
            />
            <Menu.Item
              onPress={() => {
                setVisibilidad("grupo");
                setVisibilidadMenuVisible(false);
              }}
              title="Solo grupo"
            />
          </Menu>
        </View>

        {/* Contenido */}
        <Text style={styles.label}>Contenido</Text>
        <TextInput
          style={styles.input}
          value={contenido}
          onChangeText={setContenido}
          multiline
          placeholder="Escribe aquí los cambios de tu publicación..."
          placeholderTextColor={COLORS.textSecondary}
        />

        {/* Botón con animación */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleGuardarCambios}
            onPressIn={() => animateButton(0.97)}
            onPressOut={() => animateButton(1)}
          >
            <Text style={styles.buttonText}>Guardar cambios</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  formContainer: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 28,
    color: COLORS.text,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 6,
    color: COLORS.textSecondary,
  },
  selector: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 4,
  },
  selectorText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  input: {
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    minHeight: 140,
    textAlignVertical: "top",
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    shadowRadius: 3,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 24,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
});
