import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Button, Card, Chip, Menu } from "react-native-paper";
import { useAuth } from "../contexts/AuthContext"; // Asegúrate de que esta ruta sea correcta
import { COLORS } from "../theme/theme";
import axios from "axios";
import { API_URL } from "../constants/api";

const CreatePostScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [contenido, setContenido] = useState("");
  const [tipo, setTipo] = useState<"normal" | "ayuda" | "pregunta" | "aviso">("normal");
  const [visibilidad, setVisibilidad] = useState<"todos" | "grupo">("todos");

  const [tipoMenuVisible, setTipoMenuVisible] = useState(false);
  const [visibilidadMenuVisible, setVisibilidadMenuVisible] = useState(false);

const handlePublicar = async () => {
  if (!contenido.trim()) {
    alert("Debes escribir contenido para publicar.");
    return;
  }

  try {
    const nuevaPublicacion = {
      autorID: user?._id,
      contenido: contenido.trim(),
      grupoID: user?.grupoID,
      tipo,
      visibilidad,
      fecha: new Date(),
      activo: true,
    };

    const response = await axios.post(`${API_URL}/api/publicaciones`, nuevaPublicacion);

    if (response.status === 201) {
      alert("Publicación creada con éxito.");
      navigation.goBack();
    }
  } catch (error) {
    console.error("Error al publicar:", error);
    alert("No se pudo publicar. Revisa tu conexión o el servidor.");
  }
};


  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Crear Publicación</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handlePublicar} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Publicar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer}>


        {/* Selector de tipo */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tipo de publicación</Text>
          <Menu
            visible={tipoMenuVisible}
            onDismiss={() => setTipoMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.categorySelector}
                onPress={() => setTipoMenuVisible(true)}
              >
                <Text style={styles.categorySelectorText}>
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
                style={styles.categorySelector}
                onPress={() => setVisibilidadMenuVisible(true)}
              >
                <Text style={styles.categorySelectorText}>
                  {visibilidad === "grupo" ? "Solo grupo" : "Todos"}
                </Text>
              </TouchableOpacity>
            }
          >
            <Menu.Item onPress={() => { setVisibilidad("todos"); setVisibilidadMenuVisible(false); }} title="Todos" />
            <Menu.Item onPress={() => { setVisibilidad("grupo"); setVisibilidadMenuVisible(false); }} title="Solo grupo" />
          </Menu>
        </View>

            {/* Contenido que escribe el usuario para la realizacion de la publicacion*/}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contenido</Text>
          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder="¿Qué deseas publicar?"
            multiline
            value={contenido}
            onChangeText={setContenido}
          />
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingBottom: 8
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.textSecondary,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 10
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  saveButton: {
    marginLeft: 12,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2
  },
  saveButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 14
  },
  formContainer: {
    flexGrow: 1,
    padding: 20
  },
  inputGroup: {
    marginBottom: 24
  },
  label: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 6
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.textSecondary
  },
  contentInput: {
    backgroundColor: COLORS.surface,
    minHeight: 130,
    textAlignVertical: "top",
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: COLORS.textSecondary
  },
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderWidth: 1.2,
    borderColor: COLORS.textSecondary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 58
  },
  categorySelectorText: {
    fontSize: 16,
    color: COLORS.text
  },
  previewContainer: {
    flex: 1,
    marginTop: 24
  },
  previewCard: {
    backgroundColor: COLORS.surface,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderRadius: 16,
    padding: 20
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 10
  },
  previewMetadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14
  },
  previewAuthor: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500"
  },
  previewDate: {
    fontSize: 14,
    color: COLORS.textSecondary
  },
  previewCategoryChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    marginBottom: 12
  },
  previewCategoryText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600"
  },
  previewContent: {
    fontSize: 16,
    lineHeight: 26,
    color: COLORS.text
  }
});

