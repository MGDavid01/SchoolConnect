import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Searchbar, IconButton } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { COLORS } from "../theme/theme";
import BlogCard from "../components/BlogCard";
import { API_URL } from "../constants/api";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { BlogPost } from "../types/blog";


type SectionKey = "publicaciones" | "comentarios" | "guardados" | "likes";

type ProfileSectionsProps = {
  activeSection: SectionKey;
  onSectionChange: (section: SectionKey) => void;
};

const ProfileSections: React.FC<ProfileSectionsProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [userReactions, setUserReactions] = useState<
    Record<string, "like" | "dislike" | null>
  >({});
  const [conteoComentarios, setConteoComentarios] = useState<
    Record<string, number>
  >({});
  const [comentariosPorPublicacion, setComentariosPorPublicacion] = useState<
    Record<string, any[]>
  >({});
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [newComment, setNewComment] = useState("");
  const inputRef = useRef<TextInput>(null);

  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPostToDelete, setSelectedPostToDelete] = useState<
    string | null
  >(null);

  const [userComments, setUserComments] = useState<any[]>([]);


  // Carga de publicaciones según sección activa
  const fetchPosts = async () => {
    try {
      const publicacionesRes = await axios.get(`${API_URL}/api/publicaciones`);
      let publicaciones = publicacionesRes.data;

      if (!user) return;

      if (activeSection === "publicaciones") {
        publicaciones = publicaciones.filter(
          (p: any) => p.autorID === user._id
        );
      }

      if (activeSection === "likes") {
        const usuarioID = await AsyncStorage.getItem("correo");
        const reaccionesRes = await axios.get(
          `${API_URL}/api/reacciones/${usuarioID}`
        );
        const reacciones = reaccionesRes.data;

        const likedPostIds = Object.entries(reacciones)
          .filter(([_, tipo]) => tipo === "like")
          .map(([postId]) => postId);

        publicaciones = publicaciones.filter((p: any) =>
          likedPostIds.includes(p._id)
        );
        setUserReactions(reacciones);
      }

     if (activeSection === "comentarios") {
      // Nueva llamada para obtener SOLO comentarios del usuario
      const comentariosRes = await axios.get(
        `${API_URL}/api/comentarios/usuario/${user._id}/detallados`
      );
      setUserComments(comentariosRes.data); // Guardamos los comentarios detallados

      // Evitamos setPosts porque aquí no queremos publicaciones
      setPosts([]); 
      return; // Terminamos aquí porque solo mostramos comentarios
    }

      // Conteo de reacciones y comentarios para las publicaciones filtradas
      const conteoReaccionesRes = await axios.get(
        `${API_URL}/api/reacciones/conteo`
      );
      const conteos = conteoReaccionesRes.data;

      const conteoComentariosRes = await axios.get(
        `${API_URL}/api/comentarios/conteo/todos`
      );
      setConteoComentarios(conteoComentariosRes.data);

      // Parseamos al formato BlogPost esperado
      const parsedPosts: BlogPost[] = publicaciones.map((item: any) => ({
        id: item._id,
        title: item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1),
        content: item.contenido,
        author: item.autorNombre,
        date: new Date(item.fecha).toISOString().split("T")[0],
        category: item.visibilidad === "todos" ? "Público" : "Grupo",
        imageUrl: item.imagenURL || "",
        likes: conteos[item._id]?.like || 0,
        dislikes: conteos[item._id]?.dislike || 0,
        comments: [], // inicial vacío, se llena al abrir modal
        type: "blog",
      }));

      setPosts(parsedPosts);
    } catch (error) {
      console.error("Error al cargar publicaciones:", error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeSection]);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [activeSection])
  );

  // Reacciones like/dislike
  const handleReaction = async (postId: string, type: "like" | "dislike") => {
    const currentReaction = userReactions[postId];
    const newReactions = { ...userReactions };
    const usuarioID = await AsyncStorage.getItem("correo");
    if (!usuarioID) return;

    try {
      if (currentReaction === type) {
        // Quitar reacción
        newReactions[postId] = null;
        await axios.post(`${API_URL}/api/reacciones`, {
          usuarioID,
          publicacionID: postId,
          tipo: type,
          accion: "eliminar",
        });
      } else {
        // Agregar o cambiar reacción
        newReactions[postId] = type;
        await axios.post(`${API_URL}/api/reacciones`, {
          usuarioID,
          publicacionID: postId,
          tipo: type,
          accion: "agregar",
        });
      }

      // Actualizamos conteos y reacciones
      const conteoRes = await axios.get(`${API_URL}/api/reacciones/conteo`);
      const conteos = conteoRes.data;

      // Actualizamos posts con nuevos conteos
      setPosts((prevPosts) =>
        prevPosts
          .map((p) => ({
            ...p,
            likes: conteos[p.id]?.like || 0,
            dislikes: conteos[p.id]?.dislike || 0,
          }))
          // **Muy importante**: para likes y comentarios, si ya no aplica la sección,
          // la filtramos para que desaparezca del listado:
          .filter((p) => {
            if (activeSection === "likes") {
              // debe tener like activo
              return newReactions[p.id] === "like";
            }
            if (activeSection === "comentarios") {
              // Si ya no hay comentario del usuario, la quitamos
              // Para eso, chequeamos si el post está en comentariosPorPublicacion con el comentario del usuario
              // Lo mejor: recargar posts para actualizar esa info
              return true; // mejor recargar completo, lo hacemos abajo
            }
            return true;
          })
      );

      setUserReactions(newReactions);

      // Para que lista "comentarios" se actualice al quitar comentario o al cambiar reacciones,
      // recargamos toda la lista si estamos en "comentarios"
      if (activeSection === "comentarios") {
        await fetchPosts();
      }
    } catch (error) {
      console.error("Error al actualizar reacción:", error);
    }
  };

  // Abrir modal de comentarios
  const handleCommentPress = async (post: BlogPost) => {
    try {
      const res = await axios.get(`${API_URL}/api/comentarios/${post.id}`);
      const comentarios = res.data;

      const enrichedComments = comentarios.map((c: any) => ({
        id: c._id,
        content: c.contenido,
        author: c.autorNombre || c.usuarioID,
        date: new Date(c.fecha).toISOString().split("T")[0],
      }));

      setComentariosPorPublicacion((prev) => ({
        ...prev,
        [post.id]: enrichedComments,
      }));

      setSelectedPost({ ...post, comments: enrichedComments });
      setCommentModalVisible(true);
    } catch (error) {
      console.error("❌ Error al cargar comentarios:", error);
    }
  };

  // Agregar comentario nuevo
  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost) return;

    try {
      const payload = {
        publicacionID: selectedPost.id,
        usuarioID: user?._id,
        contenido: newComment.trim(),
      };

      const res = await axios.post(`${API_URL}/api/comentarios`, payload);
      const nuevoComentario = res.data;

      const enriched = {
        id: nuevoComentario._id,
        content: nuevoComentario.contenido,
        author:
          user?.nombre +
          " " +
          user?.apellidoPaterno +
          " " +
          user?.apellidoMaterno,
        date: new Date(nuevoComentario.fecha).toISOString().split("T")[0],
      };

      // Actualizar comentarios en modal
      setSelectedPost((prev) =>
        prev ? { ...prev, comments: [...prev.comments, enriched] } : prev
      );

      // Actualizar posts para que reflejen el nuevo comentario (y conteos)
      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id
            ? { ...p, comments: [...(p.comments || []), enriched] }
            : p
        )
      );

      // Actualizar conteo global de comentarios
      setConteoComentarios((prev) => ({
        ...prev,
        [selectedPost.id]: (prev[selectedPost.id] || 0) + 1,
      }));

      setNewComment("");
      inputRef.current?.clear();

      // Si estamos en sección "comentarios", recargamos posts para que aparezca la nueva publicación si no estaba aún
      if (activeSection === "comentarios") {
        await fetchPosts();
      }
    } catch (error) {
      console.error("❌ Error al agregar comentario:", error);
    }
  };

  // Eliminar publicación
  const handleEliminar = (postId: string) => {
  setSelectedPostToDelete(postId);
  setDeleteModalVisible(true);
};

const confirmDeletePost = async () => {
  if (!selectedPostToDelete) return;

  try {
   const res = await axios.patch(`${API_URL}/api/publicaciones/${selectedPostToDelete}`, {
      userID: user!._id,
      accion: "eliminar",
    });
     console.log("Respuesta al eliminar:", res.data);
    // Elimina de la lista local
    setPosts((prev) => prev.filter((p) => p.id !== selectedPostToDelete));

    setDeleteModalVisible(false);
    setSelectedPostToDelete(null);
  } catch (error) {
    console.error("Error al eliminar publicación:", error);
  }
};

  const actualizarPost = (postActualizado: BlogPost) => {
  setPosts((prev) =>
    prev.map((p) => (p.id === postActualizado.id ? postActualizado : p))
  );
};


  const sections: { key: SectionKey; label: string }[] = [
    { key: "publicaciones", label: "Publicaciones" },
    { key: "comentarios", label: "Comentarios" },
    { key: "guardados", label: "Guardados" },
    { key: "likes", label: "Likes" },
  ];

  return (
    <View style={styles.sectionsContainer}>
      {/* Tabs */}
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

      {/* Contenido */}
      <View style={styles.sectionContent}>
        {activeSection === "guardados" ? (
          <Text style={styles.emptyText}>Esta sección está en construcción.</Text>
        ) : activeSection === "comentarios" ? (
          userComments.length === 0 ? (
            <Text style={styles.emptyText}>No has hecho comentarios.</Text>
          ) : (
            <ScrollView>
              {userComments.map((comment) => (
                <View key={comment._id} style={styles.commentItem}>
                  <Text style={styles.commentAuthor}>
                    En publicación: {comment.publicacion?.titulo || "Sin título"}
                  </Text>
                  <Text style={styles.commentText}>{comment.contenido}</Text>
                  <Text style={styles.commentDate}>
                    {new Date(comment.fecha).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )
        ) : posts.length === 0 ? (
          <Text style={styles.emptyText}>No hay publicaciones.</Text>
        ) : (
          <ScrollView>
            {posts.map((post) => (
              <View key={post.id} style={{ marginBottom: 20 }}>
                <BlogCard
                  post={post}
                  expanded={expandedPostId === post.id}
                  userReaction={userReactions[post.id] || null}
                  onExpand={(id) =>
                    setExpandedPostId((prev) => (prev === id ? null : id))
                  }
                  onReact={handleReaction}
                  onComment={handleCommentPress}
                  onViewMore={() => {}}
                  comentarioCount={conteoComentarios[post.id] || 0}
                />

                {/* Botones editar/eliminar solo si es del usuario */}
                {post.author ===
                  `${user?.nombre} ${user?.apellidoPaterno} ${user?.apellidoMaterno}` && (
                  <>
                    <TouchableOpacity
                      onPress={() => handleEliminar(post.id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.buttonText}>Eliminar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        navigation.navigate("EditPost", {
                          post,
                          onSave: actualizarPost,
                        });
                      }}
                      style={styles.editButton}
                    >
                      <Text style={styles.buttonText}>Editar</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>


      {/* Modal Comentarios */}
      <Modal
        visible={commentModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCommentModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comentarios</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setCommentModalVisible(false)}
              />
            </View>

            <ScrollView style={styles.commentsList}>
              {selectedPost?.comments && selectedPost.comments.length > 0 ? (
                selectedPost.comments.map((comment) => (
                  <View key={comment.id} style={styles.commentItem}>
                    <Text style={styles.commentAuthor}>{comment.author}</Text>
                    <Text style={styles.commentText}>{comment.content}</Text>
                    <View style={styles.commentMeta}>
                      <Text style={styles.commentDate}>{comment.date}</Text>
                    </View>
                  </View>
                ))
              ) : (
                <Text style={{ textAlign: "center", color: COLORS.textSecondary }}>
                  No hay comentarios aún.
                </Text>
              )}
            </ScrollView>

            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.commentInputContainer}
            >
              <TextInput
                ref={inputRef}
                style={styles.commentInput}
                placeholder="Escribe un comentario..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
                maxLength={500}
              />
              <IconButton
                icon="send"
                size={24}
                onPress={handleAddComment}
                disabled={!newComment.trim()}
                iconColor={newComment.trim() ? COLORS.primary : COLORS.textSecondary}
              />
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>

      {/* Modal Confirmación eliminación */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.modalTitle}>¿Eliminar publicación?</Text>
            <Text style={styles.modalText}>Esta acción no se puede deshacer.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.textSecondary }]}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: COLORS.error }]}
                onPress={confirmDeletePost}
              >
                <Text style={styles.modalButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProfileSections;

const styles = StyleSheet.create({
  sectionsContainer: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  sectionTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
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
    flex: 1,
    minHeight: 100,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: "center",
    marginTop: 40,
  },

  // Botones editar y eliminar
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,0,0,0.8)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  editButton: {
    position: "absolute",
    top: 10,
    right: 80,
    backgroundColor: "rgba(0,123,255,0.8)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    zIndex: 10,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 12,
  },

  // Modal comentarios
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    maxHeight: "80%",
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  commentsList: {
    maxHeight: 300,
    marginBottom: 10,
  },
  commentItem: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    paddingVertical: 8,
  },
  commentAuthor: {
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 2,
  },
  commentText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 4,
  },
  commentMeta: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  commentDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.background,
    paddingTop: 5,
  },
  commentInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 14,
    color: COLORS.text,
  },

  // Modal confirmación eliminar
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  confirmModal: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 8,
    width: "100%",
    maxWidth: 350,
  },
  modalText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginVertical: 10,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginLeft: 10,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
