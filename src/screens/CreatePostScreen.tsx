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
    try {
      const nuevaPublicacion = {
        autorID: user?._id,
        contenido,
        tipo,
        visibilidad,
        fecha: new Date(),
        activo: true
      };

      await axios.post(`${API_URL}/publicaciones`, nuevaPublicacion);

      navigation.goBack();
    } catch (error) {
      console.error("Error al publicar:", error);
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

        {/* Vista previa */}
        <View style={styles.previewContainer}>
          <Card style={styles.previewCard}>
            <Card.Content>
              <Text style={styles.previewTitle}>Vista previa</Text>

              <View style={styles.previewMetadata}>
                <Text style={styles.previewAuthor}>Autor: {user?._id}</Text>
                <Text style={styles.previewDate}>{new Date().toLocaleDateString()}</Text>
              </View>

              <Chip style={styles.previewCategoryChip}>
                <Text style={styles.previewCategoryText}>{tipo}</Text>
              </Chip>

              <Text style={styles.previewContent}>{contenido}</Text>
            </Card.Content>
          </Card>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: COLORS.surface
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 8
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  saveButton: {
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600"
  },
  formContainer: {
    flexGrow: 1,
    padding: 16
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    padding: 10
  },
  contentInput: {
    backgroundColor: COLORS.surface,
    minHeight: 120,
    textAlignVertical: "top"
  },
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 56
  },
  categorySelectorText: {
    fontSize: 16,
    color: COLORS.text
  },
  previewContainer: {
    flex: 1,
    marginTop: 20
  },
  previewCard: {
    backgroundColor: COLORS.surface,
    elevation: 4,
    borderRadius: 8,
    padding: 16
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8
  },
  previewMetadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
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
    marginBottom: 12,
    backgroundColor: COLORS.primary
  },
  previewCategoryText: {
    color: "white",
    fontSize: 12
  },
  previewContent: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text
  }
});
