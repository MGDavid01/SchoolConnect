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
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Text,
  IconButton,
  Searchbar,
  FAB,
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

interface BlogScreenProps {
  navigation: NavigationProp<any>;
}

const BlogScreen = ({ navigation }: BlogScreenProps) => {
  const [posts, setPosts] = useState<BlogPost[]>([  ]);
  
  useEffect(() => {
  const fetchPosts = async () => {
    try {
      const publicacionesRes = await axios.get(`${API_URL}/api/publicaciones`);
      const publicaciones = publicacionesRes.data;
        
      const conteoRes = await axios.get(`${API_URL}/api/reacciones/conteo`);
      const conteos = conteoRes.data;

      const comentariosRes = await axios.get(`${API_URL}/api/comentarios/conteo/todos`);
      const conteoComentarios = comentariosRes.data;


      const usuarioID = await AsyncStorage.getItem("correo");
      console.log("📩 usuarioID recuperado de AsyncStorage:", usuarioID);
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
        imageUrl: item.imagenURL || "",
        likes: conteos[item._id]?.like || 0,
        dislikes: conteos[item._id]?.dislike || 0,
        comments: [],
        type: "blog",
      }));

      setPosts(parsedPosts);
    } catch (error) {
      console.error("Error al cargar publicaciones o reacciones:", error);
    }
  };

  fetchPosts();

  const handler = () => {
    fetchPosts();
  };

  eventBus.on("reactionChanged", handler);

  return () => {
    eventBus.off("reactionChanged", handler);
  };
  }, []);


  const [searchQuery, setSearchQuery] = useState("");
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [newComment, setNewComment] = useState("");
  const [userReactions, setUserReactions] = useState<Record<string, "like" | "dislike" | null>>({});
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

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



  const handleCommentPress = (post: BlogPost) => {
    setSelectedPost(post);
    setCommentModalVisible(true);
  };

  const handleAddComment = () => {
    if (!selectedPost || !newComment.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now().toString(),
      content: newComment.trim(),
      author: "Usuario Actual", // Esto debería venir del contexto de autenticación
      date: new Date().toISOString().split("T")[0],
      likes: 0,
    };

    setPosts(
      posts.map((post) => {
        if (post.id === selectedPost.id) {
          return {
            ...post,
            comments: [newCommentObj, ...post.comments],
          };
        }
        return post;
      })
    );

    setNewComment("");
  };

  const handleExpandPost = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar publicaciones..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <ScrollView>
        {filteredPosts.map((post) => (
          <BlogCard
            key={post.id}
            post={post}
            expanded={expandedPostId === post.id}
            userReaction={userReactions[post.id]}
            onExpand={handleExpandPost}
            onReact={handleReaction}
            onComment={handleCommentPress}
              onViewMore={() => {
                // lógica que quieras para ver más (puede ser navegar a detalle)
              }}
          />
        ))}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
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
              {selectedPost?.comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Text style={styles.commentAuthor}>{comment.author}</Text>
                  <Text style={styles.commentText}>{comment.content}</Text>
                  <View style={styles.commentMeta}>
                    <Text style={styles.commentDate}>{comment.date}</Text>
                    <TouchableOpacity style={styles.commentLike}>
                      <IconButton
                        icon="thumb-up-outline"
                        size={16}
                        iconColor={COLORS.textSecondary}
                      />
                      <Text style={styles.likeCount}>{comment.likes}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 8,
    elevation: 4,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: COLORS.background,
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
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
  },
  commentsList: {
    flex: 1,
    padding: 16,
  },
  commentItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
  },
  commentAuthor: {
    fontWeight: "bold",
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 8,
  },
  commentMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  commentDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  commentLike: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: -4,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    backgroundColor: COLORS.surface,
  },
  commentInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
});

export default BlogScreen;