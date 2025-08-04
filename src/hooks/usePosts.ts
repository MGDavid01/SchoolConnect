import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
import { useAuth } from "../contexts/AuthContext";
import { BlogPost, Comment } from "../types/blog";
import { TextInput } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

/**
 * Hook para manejar publicaciones con likes/dislikes y comentarios.
 * Puede filtrar solo posts con "likes" (para ProfileSections).
 */
export const usePosts = ({ likedOnly  = false }: { likedOnly ?: boolean } = {}) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [conteoComentarios, setConteoComentarios] = useState<Record<string, number>>({});
  const [userReactions, setUserReactions] = useState<Record<string, "like" | "dislike" | null>>({});
  const [comentariosPorPublicacion, setComentariosPorPublicacion] = useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [newComment, setNewComment] = useState("");
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

   // Para eliminación de publicaciones
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedPostToDelete, setSelectedPostToDelete] = useState<string | null>(null);

  // --- Obtener publicaciones ---
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const usuarioID = await AsyncStorage.getItem("correo");
      let publicaciones: any[] = [];
      let reacciones: Record<string, "like" | "dislike"> = {};

      if (likedOnly  && usuarioID) {
        // Traer solo publicaciones que el usuario ha dado "like"
        const resReacciones = await axios.get(`${API_URL}/api/reacciones/${usuarioID}`);
        reacciones = resReacciones.data;
        const likedPostIds = Object.entries(reacciones)
          .filter(([_, tipo]) => tipo === "like")
          .map(([postId]) => postId);

        if (likedPostIds.length > 0) {
          const resPosts = await axios.post(`${API_URL}/api/publicaciones/bulk`, { ids: likedPostIds });
          publicaciones = resPosts.data;
        }
      } else {
        // Traer todas las publicaciones
        const res = await axios.get(`${API_URL}/api/publicaciones`);
        publicaciones = res.data;

        if (usuarioID) {
          const resReacciones = await axios.get(`${API_URL}/api/reacciones/${usuarioID}`);
          reacciones = resReacciones.data;
        }
      }

      // Conteos de reacciones y comentarios
      const conteoReaccionesRes = await axios.get(`${API_URL}/api/reacciones/conteo`);
      const conteosReacciones = conteoReaccionesRes.data;

      const conteoComentariosRes = await axios.get(`${API_URL}/api/comentarios/conteo/todos`);
      setConteoComentarios(conteoComentariosRes.data);

      // Normalizar datos de publicaciones
      const parsedPosts: BlogPost[] = publicaciones.map((item) => ({
        id: item._id,
        title: item.tipo.charAt(0).toUpperCase() + item.tipo.slice(1),
        content: item.contenido,
        author: item.autorNombre || "Autor desconocido",
        date: new Date(item.fecha).toISOString().split("T")[0],
        category: item.visibilidad === "todos" ? "Público" : "Grupo",
        imageUrl: item.imagenURL || "",
        likes: conteosReacciones[item._id]?.like || 0,
        dislikes: conteosReacciones[item._id]?.dislike || 0,
        comments: [],
        type: "blog",
        guardada: false, // Agregar propiedad requerida
      }));

      setPosts(parsedPosts);
      setUserReactions(reacciones);
    } catch (error) {
      console.error("❌ Error al cargar publicaciones:", error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar publicaciones al montar y al enfocar la pantalla
  useEffect(() => {
    fetchPosts();
  }, [likedOnly ]);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [likedOnly ])
  );

  // --- Manejar likes/dislikes ---
  const handleReaction = async (postId: string, type: "like" | "dislike") => {
    const currentReaction = userReactions[postId];
    const newReactions = { ...userReactions };
    const usuarioID = await AsyncStorage.getItem("correo");
    if (!usuarioID) return;

    try {
      if (currentReaction === type) {
        // Quitar reacción existente
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

      // Traer conteo actualizado desde backend
      const conteoRes = await axios.get(`${API_URL}/api/reacciones/conteo`);
      const conteos = conteoRes.data;

      setPosts((prev) =>
        prev.map((p) => ({
          ...p,
          likes: conteos[p.id]?.like || 0,
          dislikes: conteos[p.id]?.dislike || 0,
        }))
      );
      setUserReactions(newReactions);

      if (likedOnly ) {
        // Si estamos en la pestaña de likes, refrescar lista
        await fetchPosts();
      }
    } catch (error) {
      console.error("❌ Error al actualizar reacción:", error);
    }
  };

  // --- Manejar apertura de comentarios ---
  const handleCommentPress = async (post: BlogPost) => {
    try {
      const res = await axios.get(`${API_URL}/api/comentarios/${post.id}`);
      const comentarios = res.data;

      const enrichedComments: Comment[] = comentarios.map((c: any) => ({
        id: c._id,
        content: c.contenido,
        author: c.autorNombre || c.usuarioID,
        date: new Date(c.fecha).toISOString().split("T")[0],
      }));

      setComentariosPorPublicacion((prev) => ({
        ...prev,
        [post.id]: enrichedComments,
      }));

      setSelectedPost({
        ...post,
        comments: enrichedComments,
      });
    } catch (error) {
      console.error("❌ Error al cargar comentarios:", error);
    }
  };

  // --- Manejar agregar comentario ---
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
        author: user?.nombre + " " + user?.apellidoPaterno + " " + user?.apellidoMaterno,
        date: new Date(nuevoComentario.fecha).toISOString().split("T")[0],
      };

      // Actualizar estado local
      setPosts((prev) =>
        prev.map((p) =>
          p.id === selectedPost.id ? { ...p, comments: [...(p.comments || []), enriched] } : p
        )
      );
      setSelectedPost((prev) =>
        prev ? { ...prev, comments: [...prev.comments, enriched] } : prev
      );

      setNewComment("");
      inputRef.current?.clear();

      // Actualizar contador
      setConteoComentarios((prev) => ({
        ...prev,
        [selectedPost.id]: (prev[selectedPost.id] || 0) + 1,
      }));
    } catch (error) {
      console.error("❌ Error al agregar comentario:", error);
    }
  };

  const handleEliminar = (postId: string) => {
    setSelectedPostToDelete(postId);
    setDeleteModalVisible(true);
  };

  const confirmDeletePost = async () => {
    if (!selectedPostToDelete) return;

    try {
      await axios.patch(`${API_URL}/api/publicaciones/${selectedPostToDelete}`, {
        userID: user?._id,
      });

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

  useEffect(() => {
    fetchPosts();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  return {
    posts,
    loading,
    conteoComentarios,
    userReactions,
    comentariosPorPublicacion,
    selectedPost,
    newComment,
    expandedPostId,
    inputRef,
    setNewComment,
    setSelectedPost,
    setExpandedPostId,
    handleReaction,
    handleCommentPress,
    handleAddComment,
    actualizarPost,
    handleEliminar,
    confirmDeletePost,
    deleteModalVisible,
    setDeleteModalVisible,
    selectedPostToDelete,
  };
};
