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
  Animated,
  Easing 
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
import CommentCard from "./CommentCard";


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
  const [savedPosts, setSavedPosts] = useState<string[]>([]);


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
        visibilidad: item.visibilidad,   // <-- añadir esto
        tipo: item.tipo, 
        imageUrl: item.imagenURL || "",
        likes: conteos[item._id]?.like || 0,
        dislikes: conteos[item._id]?.dislike || 0,
        comments: [], // inicial vacío, se llena al abrir modal
        type: "blog",
        guardada: savedPosts.includes(item._id),
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

   const toggleGuardar = async (postId: string, yaGuardada: boolean) => {
  try {
    if (yaGuardada) {
      await axios.delete(`${API_URL}/api/guardados`, {
        data: { usuarioID: user?._id, publicacionID: postId },
      });
      setSavedPosts((prev) => prev.filter((id) => id !== postId));
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, guardada: false } : p))
      );
    } else {
      await axios.post(`${API_URL}/api/guardados`, {
        usuarioID: user?._id,
        publicacionID: postId,
      });
      setSavedPosts((prev) => [...prev, postId]);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, guardada: true } : p))
      );
    }
  } catch (error) {
    console.error("Error al guardar/quitar publicación:", error);
  }
};

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

  const [savedPostsData, setSavedPostsData] = useState<BlogPost[]>([]);

useEffect(() => {
  const fetchSavedPosts = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/guardados/${user?._id}`);
      // El backend debería devolver un array con los objetos de publicación o sus IDs
      const savedIDs = res.data.map((p: any) => p._id || p.id);
      setSavedPosts(savedIDs);
    } catch (error) {
      console.error("Error al obtener publicaciones guardadas:", error);
    }
  };

  if (user?._id) {
    fetchSavedPosts();
  }
}, [user]);


  const sections: { key: SectionKey; label: string }[] = [
    { key: "publicaciones", label: "Publicaciones" },
    { key: "comentarios", label: "Comentarios" },
    { key: "guardados", label: "Guardados" },
    { key: "likes", label: "Likes" },
  ];

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

  return (
    <View style={styles.sectionsContainer}>
      {/* Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionTabsContainer}
      >
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
      </ScrollView>

      {/* Contenido */}
      <View style={styles.sectionContent}>
        {activeSection === "guardados" ? (
  <ScrollView>
    {posts
            .filter((post) => savedPosts.includes(post.id)) // Solo publicaciones guardadas
            .map((post) => (
              <View key={post.id} style={{ marginBottom: 20 }}>
                <BlogCard
                  post={post}
                  expanded={expandedPostId === post.id}
                  userReaction={userReactions[post.id] || null}
                  onExpand={(id) => setExpandedPostId((prev) => (prev === id ? null : id))}
                  onReact={handleReaction}
                  onComment={handleCommentPress}
                  extraActions={post.author === `${user?.nombre} ${user?.apellidoPaterno} ${user?.apellidoMaterno}`}
                  isSaved={savedPosts.includes(post.id)}
                  onToggleSave={toggleGuardar}
                  onViewMore={() => {}}
                  comentarioCount={conteoComentarios[post.id] || 0}
                   />
                      </View>
                    ))}
     
  </ScrollView>
) : activeSection === "comentarios" ? (
            userComments.length === 0 ? (
              <Text style={styles.emptyText}>No has hecho ningún comentario aún.</Text>
            ) : (
              <ScrollView>
                {userComments.map((comment) => (
                  <CommentCard
                    key={comment._id}
                    author={comment.autorNombre}
                    content={comment.contenido}
                    date={new Date(comment.fecha).toISOString().split("T")[0]}
                  />
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
                  extraActions={post.author === `${user?.nombre} ${user?.apellidoPaterno} ${user?.apellidoMaterno}`}
                  onViewMore={() => {}}
                  comentarioCount={conteoComentarios[post.id] || 0}
                  isSaved={savedPosts.includes(post.id)}
                  onToggleSave={toggleGuardar}
                />
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
           <Animated.View
             style={[
               styles.confirmModal,
               {
                 opacity: opacityAnim,
                 transform: [{ scale: scaleAnim }],
               },
             ]}
           >
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
           </Animated.View>
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
  sectionTabsContainer: {
    paddingHorizontal: 20,
  },
  sectionTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
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
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
    paddingTop: 8,
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
  borderRadius: 30, // más redondeado
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
  
//diseño para los botones de eliminar y modificar
floatingButtons: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    gap: 8, // separa los iconos
    zIndex: 10,
    paddingRight: 15,
  },
  floatingBtn: {
    backgroundColor: "rgba(0,0,0,0.4)", // fondo translúcido neutro
    borderRadius: 20,
    elevation: 3,
  },
  editIcon: {
    backgroundColor: "rgba(0,122,255,0.85)", // azul sutil
  },
  deleteIcon: {
    backgroundColor: "rgba(255,77,77,0.85)", // rojo sutil
  },
});
