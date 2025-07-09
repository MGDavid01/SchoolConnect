import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { COLORS } from "../theme/theme";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

type SectionKey = "publicaciones" | "comentarios" | "guardados" | "likes";

type Post = {
  id: string;
  title: string;
  content: string;
  // otros campos que necesites mostrar
};

type ProfileSectionsProps = {
  activeSection: SectionKey;
  onSectionChange: (section: SectionKey) => void;
};

const ProfileSections: React.FC<ProfileSectionsProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  useEffect(() => {
    if (activeSection === "likes") {
      fetchLikedPosts();
    }
  }, [activeSection]);

  const fetchLikedPosts = async () => {
    setLoadingLikes(true);
    try {
      const usuarioID = await AsyncStorage.getItem("correo");
      if (!usuarioID) {
        setLikedPosts([]);
        setLoadingLikes(false);
        return;
      }

      // 1. Obtener las reacciones del usuario
      const resReacciones = await axios.get(`${API_URL}/api/reacciones/${usuarioID}`);
      const reacciones = resReacciones.data; // { publicacionID: "like" | "dislike" }

      // 2. Filtrar solo las que son "like"
      const likedPostIds = Object.entries(reacciones)
        .filter(([_, tipo]) => tipo === "like")
        .map(([postId]) => postId);

      if (likedPostIds.length === 0) {
        setLikedPosts([]);
        setLoadingLikes(false);
        return;
      }

      // 3. Obtener los detalles de esas publicaciones
      // Supongo que tienes un endpoint para obtener publicaciones por IDs
      // Si no, puede que tengas que obtener todas y filtrarlas localmente
      const resPosts = await axios.post(`${API_URL}/api/publicaciones/bulk`, {
        ids: likedPostIds,
      });

      setLikedPosts(resPosts.data); // Ajusta según respuesta real
    } catch (error) {
      console.error("Error al cargar publicaciones liked", error);
      setLikedPosts([]);
    } finally {
      setLoadingLikes(false);
    }
  };

  const sections: { key: SectionKey; label: string }[] = [
    { key: "publicaciones", label: "Publicaciones" },
    { key: "comentarios", label: "Comentarios" },
    { key: "guardados", label: "Guardados" },
    { key: "likes", label: "Likes" },
  ];

  return (
    <View style={styles.sectionsContainer}>
      <View style={styles.sectionTabs}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.key}
            style={[
              styles.sectionTab,
              activeSection === section.key && styles.activeSectionTab,
            ]}
            onPress={() => onSectionChange(section.key)}
          >
            <Text
              style={[
                styles.sectionTabText,
                activeSection === section.key && styles.activeSectionTabText,
              ]}
            >
              {section.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

<View style={styles.sectionContent}>
  {activeSection === "publicaciones" ? (
    <Text style={styles.emptyText}>No hay publicaciones aún</Text>
  ) : activeSection === "likes" ? (
    loadingLikes ? (
      <Text style={styles.emptyText}>Cargando likes...</Text>
    ) : likedPosts.length === 0 ? (
      <Text style={styles.emptyText}>No hay publicaciones con like aún</Text>
    ) : (
      <ScrollView>
        {likedPosts.map((post) => (
          <View key={String(post.id)} style={{ marginBottom: 12 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16 }}>{post.title}</Text>
            <Text numberOfLines={2}>{post.content}</Text>
          </View>
        ))}
      </ScrollView>
    )
  ) : (
    <Text style={styles.emptyText}>No hay reacciones aún</Text>
  )}
</View>

    </View>
  );
};

export default ProfileSections;

const styles = StyleSheet.create({
  sectionsContainer: {
    backgroundColor: COLORS.surface,
    paddingTop: 0,
  },
  sectionTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    marginBottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
  },
  sectionTab: {
    paddingBottom: 10,
    marginRight: 20,
  },
  activeSectionTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  sectionTabText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  activeSectionTabText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  sectionContent: {
    minHeight: 100,
    padding: 20,
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});
