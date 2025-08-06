import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  TouchableWithoutFeedback
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Text,
  IconButton,
  Searchbar,
  FAB,
  Menu,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../theme/theme";
import BlogCard from "../components/BlogCard";
import { NavigationProp } from "@react-navigation/native";
import { BlogPost, Comment } from "../types/blog"; // ajusta la ruta si es necesario

import { API_URL } from "../constants/api";
import { useEffect } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { eventBus } from "../utils/eventBus";
import { useAuth } from "../contexts/AuthContext";
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface BlogScreenProps {
  navigation: NavigationProp<any>;
}

import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const ICON_SIZE = 18;

const BlogScreen = ({ navigation }: BlogScreenProps) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([  ]);
  const [conteoComentarios, setConteoComentarios] = useState<Record<string, number>>({});
  const [comentariosPorPublicacion, setComentariosPorPublicacion] = useState<Record<string, any[]>>({});
        const fetchComentarios = async (postId: string) => {
        try {
          const res = await axios.get(`${API_URL}/api/comentarios/${postId}`);
          setComentariosPorPublicacion((prev) => ({
            ...prev,
            [postId]: res.data,
          }));
        } catch (error) {
          console.error("❌ Error al cargar comentarios", error);
        }
      };
 const [filtroVisibilidad, setFiltroVisibilidad] = useState<"todos" | "grupo">("todos");
  const [filtroTipo, setFiltroTipo] = useState<"todas" | "General" | "Ayuda" | "Pregunta" | "Aviso">("todas");
  const [visibilidadMenuVisible, setVisibilidadMenuVisible] = useState(false);
  const [tipoMenuVisible, setTipoMenuVisible] = useState(false);
      
 const fetchPosts = async () => {
    if (!user) return; // aseguramos que hay usuario logueado
  try {
    console.log("Filtro visibilidad:", filtroVisibilidad);
    console.log("Grupo del usuario:", user.grupoID);
    console.log("Filtro tipo:", filtroTipo);

    const publicacionesRes = await axios.get(`${API_URL}/api/publicaciones`, {
      params: { 
        filtroVisibilidad, // <-- ahora lo enviamos explícitamente
        grupoID: user.grupoID, // <-- siempre lo enviamos, el backend decidirá si usarlo
        tipo: filtroTipo !== "todas" ? filtroTipo : undefined,
      }
    });

      
      const publicaciones = publicacionesRes.data;

      const conteoRes = await axios.get(`${API_URL}/api/reacciones/conteo`);
      const conteos = conteoRes.data;

      const comentariosRes = await axios.get(`${API_URL}/api/comentarios/conteo/todos`);
      const conteoComentariosData = comentariosRes.data;
      setConteoComentarios(conteoComentariosData);

      const usuarioID = await AsyncStorage.getItem("correo");
      let reacciones: Record<string, "like" | "dislike"> = {};
      if (usuarioID) {
        const reaccionRes = await axios.get(`${API_URL}/api/reacciones/${usuarioID}`);
        reacciones = reaccionRes.data;
        setUserReactions(reacciones);
      }

      const parsedPosts: BlogPost[] = publicaciones.map((item: any) => ({
        id: item._id,
        title: item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1),
        content: item.contenido,
        author: item.autorNombre,
        date: new Date(item.fecha).toISOString().split("T")[0],
        category: item.visibilidad === "todos" ? "Público" : "Grupo",
        visibilidad: item.visibilidad,   // <-- añadir esto
        tipo: item.tipo, 
        imageUrl: item.imagenURL || "",
        likes: conteos[item._id]?.like || 0,
        dislikes: conteos[item._id]?.dislike || 0,
        comments: [],
        type: "blog",
        guardada: savedPosts.includes(item._id),
      }));

      setPosts(parsedPosts);
    } catch (error) {
      console.error("Error al cargar publicaciones o reacciones:", error);
    }
  };

useEffect(() => {  
  console.log("Filtro visibilidad:", filtroVisibilidad);
  console.log("Grupo del usuario:", user?.grupoID);
  console.log("Filtro tipo:", filtroTipo);
  if (user?.grupoID) {
    fetchPosts();
  }
}, [filtroVisibilidad, filtroTipo, user?.grupoID]);

useFocusEffect(
  useCallback(() => {
    fetchPosts();
  }, [filtroVisibilidad, filtroTipo, user?.grupoID])
);

const fetchSaved = async () => {
  if (!user?._id) return;
  try {
    const res = await axios.get(`${API_URL}/api/guardados/${user._id}`);
    const savedIDs = res.data.map((p: any) => p._id || p.id);
    setSavedPosts(savedIDs);
  } catch (error) {
    console.error("Error al cargar guardados:", error);
  }
};

useEffect(() => {
  fetchSaved();
}, [user?._id]);

// También recargar cada vez que la pantalla se enfoque
useFocusEffect(
  useCallback(() => {
    fetchPosts();
    fetchSaved(); // <-- ahora también aquí
  }, [filtroVisibilidad, filtroTipo, user?.grupoID])
);

  


  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [newComment, setNewComment] = useState("");
  const [userReactions, setUserReactions] = useState<Record<string, "like" | "dislike" | null>>({});
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);



  //Cosas para el buscador, 
  const [searchQuery, setSearchQuery] = useState('');
 
  const [isSearching, setIsSearching] = useState(false);


  const [validSearch, setValidSearch] = useState(true);



 

  //Función para guardar publicaciones
  const toggleGuardar = async (postId: string, yaGuardada: boolean) => {
    try {
      if (yaGuardada) {
        await axios.delete(`${API_URL}/api/guardados`, {
          data: { usuarioID: user?._id, publicacionID: postId },
        });
        setSavedPosts((prev) => prev.filter((id) => id !== postId));
      } else {
        await axios.post(`${API_URL}/api/guardados`, {
          usuarioID: user?._id,
          publicacionID: postId,
        });
        setSavedPosts((prev) => [...prev, postId]);
      }
    } catch (error) {
      console.error("Error al guardar/quitar publicación:", error);
    }
  };


  const inputRef = useRef<TextInput>(null);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

 const handleReaction = async (postId: string, type: "like" | "dislike") => {
  console.log("Reacción activada:", { postId, type });
  const post = posts.find((p) => p.id === postId);
  if (!post) return;

  const currentReaction = userReactions[postId];
  const newReactions = { ...userReactions };

  const usuarioID = await AsyncStorage.getItem("correo");
  if (!usuarioID) return;

  try {
    if (currentReaction === type) {
      // El usuario quiere remover su reacción actual (like o dislike)
      newReactions[postId] = null;

      await axios.post(`${API_URL}/api/reacciones`, {
        usuarioID,
        publicacionID: postId,
        tipo: type,
        accion: "eliminar", // Opcional: si el backend espera un campo para distinguir
      });
    } else {
      // El usuario quiere cambiar o agregar una nueva reacción
      newReactions[postId] = type;

      await axios.post(`${API_URL}/api/reacciones`, {
        usuarioID,
        publicacionID: postId,
        tipo: type,
        accion: "agregar", // Opcional
      });
    }

    // Luego de actualizar backend, traer conteo actualizado
    const conteoRes = await axios.get(`${API_URL}/api/reacciones/conteo`);
    const conteos = conteoRes.data;

    // Actualizar posts con conteos reales del backend
    setPosts((prevPosts) =>
      prevPosts.map((p) => ({
        ...p,
        likes: conteos[p.id]?.like || 0,
        dislikes: conteos[p.id]?.dislike || 0,
      }))
    );

    // Actualizar la reacción local
    setUserReactions(newReactions);
  } catch (error) {
    console.error("Error al actualizar reacción:", error);
  }
};


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

    // ✅ Guardar los comentarios solo en el estado centralizado
    setComentariosPorPublicacion((prev) => ({
      ...prev,
      [post.id]: enrichedComments,
    }));
    console.log("🟠 Comentarios recibidos del backend:", comentarios);
    console.log("🟠 Comentarios enriquecidos:", enrichedComments);

    // ✅ Guardar el post seleccionado (sin tocar sus comments)
    setSelectedPost({
        ...(post as any),
        comments: enrichedComments,
      });

    console.log(selectedPost?.comments);
    console.log("🟢 Post seleccionado con comentarios:", {
      ...post,
      comments: enrichedComments,
    });

    // ✅ Mostrar el modal
    setCommentModalVisible(true);
  } catch (error) {
    console.error("❌ Error al cargar comentarios:", error);
  }
};

const handleAddComment = async () => {
  
  if (!newComment.trim()) return;
  if (!selectedPost) return;
  
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
      author: user?.nombre + " " + user?.apellidoPaterno + " " + user?.apellidoMaterno,
      date: new Date(nuevoComentario.fecha).toISOString().split("T")[0],
    };


    // Actualizar el estado
    setPosts((prev) =>
      prev.map((p) =>
        p.id === selectedPost.id
          ? { ...p, comments: [...(p.comments || []), enriched] }
          : p
      )
    );

    setSelectedPost((prev) =>
      prev ? { ...prev, comments: [...prev.comments, enriched] } : prev
    );

    setNewComment("");
    inputRef.current?.clear();

    // Opcional: actualizar contador global
    setConteoComentarios((prev) => ({
      ...prev,
      [selectedPost.id]: (prev[selectedPost.id] || 0) + 1,
    }));
  } catch (error) {
    console.error("❌ Error al agregar comentario:", error);
  }
};

  const actualizarPost = (postActualizado: BlogPost) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postActualizado.id ? postActualizado : p))
    );
  };

  const handleExpandPost = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  //Para el modal de confirmacion de eliminación de una publicacion hecha por un usuario
      const [deleteModalVisible, setDeleteModalVisible] = useState(false);
      const [selectedPostToDelete, setSelectedPostToDelete] = useState<string | null>(null);

      const handleEliminar = (postId: string) => {
        setSelectedPostToDelete(postId);
        setDeleteModalVisible(true);
      };

      const confirmDeletePost = async () => {
        if (!selectedPostToDelete) return;

        try {
          await axios.patch(`${API_URL}/api/publicaciones/${selectedPostToDelete}`, { userID: user!._id, accion: "eliminar"});

          // Actualizar lista localmente
          setPosts((prev) => prev.filter((p) => p.id !== selectedPostToDelete));

          setDeleteModalVisible(false);
          setSelectedPostToDelete(null);
        } catch (error) {
          console.error("Error al eliminar publicación:", error);
        }
      };

      const scaleAnim = useRef(new Animated.Value(0.8)).current;  // escala inicial
      const opacityAnim = useRef(new Animated.Value(0)).current;  // opacidad inicial
      useEffect(() => {
        if (deleteModalVisible) {
          Animated.parallel([
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 250, // un poco más lento para suavidad
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 250,
              easing: Easing.out(Easing.ease), // suavizado
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          // Al cerrar, se restablecen valores
          opacityAnim.setValue(0);
          scaleAnim.setValue(0.9); // empieza un poco más grande para cuando se abra de nuevo
        }
      }, [deleteModalVisible]);

  const showFilterModal = (type: "visibilidad" | "tipo") => {
    if (type === "visibilidad") {
      setVisibilidadMenuVisible(true);
    } else {
      setTipoMenuVisible(true);
    }
  };

  const hideFilterModal = () => {
    setVisibilidadMenuVisible(false);
    setTipoMenuVisible(false);
  };

  const getFilterLabel = (type: "visibilidad" | "tipo") => {
    if (type === "visibilidad") {
      return filtroVisibilidad === "todos" ? "Todos" : "Mi grupo";
    } else {
      return filtroTipo === "todas" ? "Todas" : filtroTipo.charAt(0).toUpperCase() + filtroTipo.slice(1);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Blog</Text>
        <View style={styles.titleAccent} />
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchbarWrapper}>
          <Searchbar
            placeholder="Buscar publicaciones..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={{ textAlignVertical: 'center' }}
          />
        </View>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => showFilterModal("visibilidad")}
          >
            <MaterialCommunityIcons name="account-group" size={ICON_SIZE} color={COLORS.surface} style={{ marginRight: 4 }} />
            <Text style={styles.filterLabel}>
              {getFilterLabel("visibilidad")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => showFilterModal("tipo")}
          >
            <MaterialCommunityIcons name="shape" size={ICON_SIZE} color={COLORS.surface} style={{ marginRight: 4 }} />
            <Text style={styles.filterLabel}>
              {getFilterLabel("tipo")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: 8, paddingBottom: 16 }}
        >
          {filteredPosts.map((post) => (
            <View key={post.id} style={styles.blogCardWrapper}>
              <BlogCard
                post={post}
                expanded={expandedPostId === post.id}
                userReaction={userReactions[post.id]}
                onExpand={handleExpandPost}
                onReact={handleReaction}
                onComment={handleCommentPress}
                onViewMore={() => {
                  // lógica que quieras para ver más
                }}
                comentarioCount={conteoComentarios[post.id] || 0}
                onEdit={(post) => navigation.navigate("EditPost", { post, onSave: actualizarPost })}
                onDelete={handleEliminar}
                isOwner={post.author === `${user?.nombre} ${user?.apellidoPaterno} ${user?.apellidoMaterno}`}
                isSaved={savedPosts.includes(post.id)}
                onToggleSave={toggleGuardar}
              />
            </View>
          ))}
        </ScrollView>
      </KeyboardAvoidingView>

      <FAB
        icon={{ source: "plus", direction: "auto" }}
        style={styles.fab}
        color="white"
        onPress={() => {
          navigation.navigate("CreatePost");
        }}
      />
      
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
                iconColor={
                  newComment.trim() ? COLORS.primary : COLORS.textSecondary
                }
              />
            </KeyboardAvoidingView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.confirmModal,
              {
                opacity: opacityAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
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
          </Animated.View>
        </View>
      </Modal>

      <Modal
        visible={visibilidadMenuVisible || tipoMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={hideFilterModal}
      >
        <TouchableWithoutFeedback onPress={hideFilterModal}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View>
                <View style={styles.modalHandle} />
                <View style={styles.filterModalContent}>
                  <Text style={styles.modalTitle}>
                    {visibilidadMenuVisible ? "Filtrar por visibilidad" : "Filtrar por tipo"}
                  </Text>
                  {visibilidadMenuVisible ? (
                    [
                      { label: "Todos", value: "todos" },
                      { label: "Mi grupo", value: "grupo" }
                    ].map(filter => (
                      <TouchableOpacity
                        key={filter.value}
                        onPress={() => {
                          setFiltroVisibilidad(filter.value as "todos" | "grupo");
                          hideFilterModal();
                        }}
                        style={[
                          styles.modalOption,
                          filtroVisibilidad === filter.value && styles.selectedModalOption
                        ]}
                      >
                        <Text style={[
                          styles.modalOptionText,
                          filtroVisibilidad === filter.value && styles.selectedModalOptionText
                        ]}>
                          {filter.label}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    [
                      { label: "Todas", value: "todas" },
                      { label: "General", value: "General" },
                      { label: "Ayuda", value: "Ayuda" },
                      { label: "Pregunta", value: "Pregunta" },
                      { label: "Aviso", value: "Aviso" }
                    ].map(filter => (
                      <TouchableOpacity
                        key={filter.value}
                        onPress={() => {
                          setFiltroTipo(filter.value as any);
                          hideFilterModal();
                        }}
                        style={[
                          styles.modalOption,
                          filtroTipo === filter.value && styles.selectedModalOption
                        ]}
                      >
                        <Text style={[
                          styles.modalOptionText,
                          filtroTipo === filter.value && styles.selectedModalOptionText
                        ]}>
                          {filter.label}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginBottom: 0,
    paddingBottom: 0,
    elevation: 2,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.surface,
    backgroundColor: COLORS.primary,
    textAlign: 'center',
    paddingVertical: 5,
    width: '100%',
  },
  titleAccent: {
    width: '40%',
    height: 3,
    backgroundColor: COLORS.secondary,
    marginTop: -2,
    marginBottom: 6,
    borderRadius: 2,
  },
  searchContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
    gap: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  searchbarWrapper: {
    marginBottom: 8,
  },
  searchbar: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    fontSize: 16,
    justifyContent: 'center',
    textAlignVertical: 'center',
    elevation: 2,
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingTop: 2,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.secondary,
    elevation: 2,
  },
  filterLabel: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: 'bold',
    paddingHorizontal: 2,
  },
  blogCardWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  card: {
    margin: 8,
    elevation: 4,
    backgroundColor: COLORS.surface,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
  },
  metadataContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  metadata: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  image: {
    height: 200,
    marginVertical: 8,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
    marginVertical: 8,
  },
  expandButton: {
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 8,
  },
  expandButtonText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  interactionBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  reactions: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  commentButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: -8,
  },
  commentCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: -8,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
    paddingTop: 8,
  },
  filterModalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 180,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },

  //diseños para la sección de comentarios
modalTitle: {
  fontSize: 22,              
  fontWeight: "800",         
  color: COLORS.primary,
  textAlign: "center",        
  marginVertical: 20,    
},
commentsList: {
  flex: 1,
  paddingHorizontal: 24,      
  paddingBottom: 16,        
  backgroundColor: COLORS.background,
},
commentItem: {
  marginBottom: 16,
  padding: 16,              
  backgroundColor: COLORS.surface,  
  borderRadius: 16,         
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.06,
  shadowRadius: 6,
  elevation: 3,
},
commentAuthor: {
  fontWeight: "700",
  fontSize: 16,               
  color: COLORS.primary,     
  marginBottom: 6,
},
commentText: {
  fontSize: 15,
  color: COLORS.text,
  marginBottom: 12,
  lineHeight: 22,          
},
commentMeta: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 8,
},
commentDate: {
  fontSize: 12,
  color: COLORS.textSecondary,
  fontStyle: "italic",      
},
commentLike: {
  flexDirection: "row",
  alignItems: "center",
},
likeCount: {
  fontSize: 14,
  color: COLORS.textSecondary,
  marginLeft: 6,             
},
commentInputContainer: {
  flexDirection: "row",
  alignItems: "center",
  padding: 12,
  borderTopWidth: 1,
  borderTopColor: COLORS.textSecondary + "33",  
  backgroundColor: COLORS.surface,
  borderRadius: 16,         
  marginHorizontal: 24,
  marginVertical: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 5,
},
commentInput: {
  flex: 1,
  backgroundColor: COLORS.background,
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingVertical: 12,
  maxHeight: 100,
  fontSize: 15,
  color: COLORS.text,
  textAlignVertical: "top",
},


  modalOverlay: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.5)"
},
confirmModal: {
  backgroundColor: COLORS.surface,
  padding: 20,
  borderRadius: 10,
  width: "80%",
  alignItems: "center"
},
//Diseño del modal de confirmacion de eliminacion de una publicacion
modalText: {
  fontSize: 16,
  color: COLORS.text,
  textAlign: "center",
  marginBottom: 20,
  lineHeight: 22,
  fontWeight: "500",
},

modalActions: {
  flexDirection: "row",
  justifyContent: "space-evenly",
  width: "100%",
  marginTop: 10,
},

modalButton: {
  flex: 1,
  paddingVertical: 12,
  marginHorizontal: 8,
  borderRadius: 30, 
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 3,
  elevation: 3,
},

modalButtonText: {
  color: "white",
  fontWeight: "bold",
  fontSize: 15,
  letterSpacing: 0.5,
},




  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  modalOption: {
    paddingVertical: 14,
    borderRadius: 8,
    marginVertical: 2,
    paddingHorizontal: 8,
  },
  selectedModalOption: {
    backgroundColor: COLORS.primary + "20",
  },
  modalOptionText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  selectedModalOptionText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
});

export default BlogScreen;

