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

  // Estados para editar
  const [contenido, setContenido] = useState(post.content);
  const [tipo, setTipo] = useState<"normal" | "ayuda" | "pregunta" | "aviso">(
    (post.tipo as any) || "normal"
  );
  const [visibilidad, setVisibilidad] = useState<"todos" | "grupo">(
    (post.categoria as "todos" | "grupo") || "todos"
  );

  const [tipoMenuVisible, setTipoMenuVisible] = useState(false);
  const [visibilidadMenuVisible, setVisibilidadMenuVisible] = useState(false);

  const handleGuardarCambios = async () => {
    try {
      await axios.patch(`${API_URL}/api/publicaciones/${post.id}`, {
        contenido,
        tipo,
        visibilidad,
        userID: user?._id
      });

      

      navigation.goBack(); // Regresar tras guardar cambios
    } catch (error) {
      console.error("Error al actualizar publicación:", error);
    }
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
        />

        {/* Botón para guardar cambios */}
        <TouchableOpacity style={styles.button} onPress={handleGuardarCambios}>
          <Text style={styles.buttonText}>Guardar cambios</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditPostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 8
  },
  formContainer: {
    flexGrow: 1,
    padding: 24
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 24,
    color: COLORS.text
  },
  inputGroup: {
    marginBottom: 24
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
    color: COLORS.text
  },
  selector: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.2,
    borderColor: COLORS.textSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4
  },
  selectorText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500"
  },
  input: {
    backgroundColor: COLORS.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    minHeight: 130,
    textAlignVertical: "top",
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    elevation: 1
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 20,
    borderRadius: 12,
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16
  }
});

