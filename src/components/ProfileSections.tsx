import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { COLORS } from "../theme/theme";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

import BlogCard from "../components/BlogCard";

import { useFocusEffect } from "@react-navigation/native";
import { eventBus } from "../utils/eventBus";

type SectionKey = "publicaciones" | "comentarios" | "guardados" | "likes";

type Post = {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: string;
  imageUrl: string;
  likes: number;
  dislikes: number;
  comments: any[];
  type: string;
};

type ProfileSectionsProps = {
  activeSection: SectionKey;
  onSectionChange: (section: SectionKey) => void;
};

const ProfileSections: React.FC<ProfileSectionsProps> = ({ activeSection, onSectionChange }) => {
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);
  const [userReactions, setUserReactions] = useState<Record<string, "like" | "dislike" | null>>({});

  const fetchLikedPosts = async () => {
  setLoadingLikes(true);
  try {
    const usuarioID = await AsyncStorage.getItem("correo");
    console.log("fetchLikedPosts - usuarioID:", usuarioID);
    if (!usuarioID) {
      setLikedPosts([]);
      setLoadingLikes(false);
      return;
    }

    const resReacciones = await axios.get(`${API_URL}/api/reacciones/${usuarioID}`);
    console.log("fetchLikedPosts - reacciones:", resReacciones.data);

    const reacciones = resReacciones.data;
    const likedPostIds = Object.entries(reacciones)
      .filter(([_, tipo]) => tipo === "like")
      .map(([postId]) => postId);

    console.log("fetchLikedPosts - likedPostIds:", likedPostIds);

    if (likedPostIds.length === 0) {
      setLikedPosts([]);
      setLoadingLikes(false);
      return;
    }

    const resPosts = await axios.post(`${API_URL}/api/publicaciones/bulk`, { ids: likedPostIds });
    console.log("fetchLikedPosts - publicaciones:", resPosts.data);

    const resConteo = await axios.get(`${API_URL}/api/reacciones/conteo`);
    const conteos = resConteo.data;
    console.log("fetchLikedPosts - conteos:", conteos);

    const parsedPosts = resPosts.data.map((p: any) => ({
      id: p._id,
      title: p.tipo.charAt(0).toUpperCase() + p.tipo.slice(1),
      content: p.contenido,
      author: p.autorNombre || "Autor desconocido",
      date: new Date(p.fecha).toISOString().split("T")[0],
      category: p.visibilidad === "todos" ? "Público" : "Grupo",
      imageUrl: p.imagenURL || "",
      likes: conteos[p._id]?.like || 0,
      dislikes: conteos[p._id]?.dislike || 0,
      comments: [],
      type: "blog",
    }));

    setLikedPosts(parsedPosts);
    setUserReactions(reacciones);
  } catch (error) {
    console.error("❌ Error al cargar publicaciones liked:", error);
    setLikedPosts([]);
  } finally {
    setLoadingLikes(false);
  }
};


  useEffect(() => {
    if (activeSection === "likes") {
      fetchLikedPosts();
    }
  }, [activeSection]);

  useFocusEffect(
    useCallback(() => {
      if (activeSection === "likes") {
        fetchLikedPosts();
      }
    }, [activeSection])
  );

  useEffect(() => {
    const handler = () => {
      if (activeSection === "likes") {
        fetchLikedPosts();
      }
    };
    eventBus.on("reactionChanged", handler);
    return () => {
      eventBus.off("reactionChanged", handler);
    };
  }, [activeSection]);

  const handleReaction = async (postId: string, type: "like" | "dislike") => {
  console.log("handleReaction:", { postId, type });
  const currentReaction = userReactions[postId];
  console.log("handleReaction - currentReaction:", currentReaction);
  const newReactions = { ...userReactions };

  const usuarioID = await AsyncStorage.getItem("correo");
  console.log("handleReaction - usuarioID:", usuarioID);
  if (!usuarioID) return;

  try {
    if (currentReaction === type) {
      newReactions[postId] = null;
      await axios.post(`${API_URL}/api/reacciones`, {
        usuarioID,
        publicacionID: postId,
        tipo: type,
        accion: "eliminar",
      });
    } else {
      newReactions[postId] = type;
      await axios.post(`${API_URL}/api/reacciones`, {
        usuarioID,
        publicacionID: postId,
        tipo: type,
        accion: "agregar",
      });
    }

    setUserReactions(newReactions);

    // Recarga las publicaciones liked
    await fetchLikedPosts();

    eventBus.emit("reactionChanged");
  } catch (error) {
    console.error("Error al actualizar reacción:", error);
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
        {activeSection === "likes" ? (
          loadingLikes ? (
            <Text style={styles.emptyText}>Cargando likes...</Text>
          ) : likedPosts.length === 0 ? (
            <Text style={styles.emptyText}>No hay publicaciones con like aún</Text>
          ) : (
            <ScrollView>
              {likedPosts.map((post) => (
                <BlogCard
                  key={post.id}
                  post={post}
                  expanded={false}
                  userReaction={userReactions[post.id] || null}
                  onReact={(postId, tipo) => {
                    console.log("Reacción en BlogCard", post.id, tipo);
                    if (tipo === "like" || tipo === "dislike") {
                      handleReaction(postId, tipo);
                    }
                  }}
                  onExpand={() => {}}
                  onComment={() => {}}
                  onViewMore={() => {}}
                />
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
