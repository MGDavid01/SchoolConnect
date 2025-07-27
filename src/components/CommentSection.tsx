import React, { useState, forwardRef } from "react";
import { View, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { IconButton, Text, Button } from "react-native-paper";
import { COLORS } from "../theme/theme";

interface Comment {
  id: string;
  text: string;
  author: string;
  likes: number;
  dislikes: number;
  userReaction: "like" | "dislike" | null;
  date: string;
}

interface CommentSectionProps {
  postId: string;
  onCommentFocus?: () => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId, onCommentFocus }) => {
  const [comments, setComments] = useState<Comment[]>([
    {
      id: "1",
      text: "Excelente publicación, muy informativa!",
      author: "Usuario1",
      likes: 5,
      dislikes: 1,
      userReaction: null,
      date: "2024-03-15"
    },
    {
      id: "2",
      text: "Me gustaría ver más contenido como este",
      author: "Usuario2",
      likes: 3,
      dislikes: 0,
      userReaction: null,
      date: "2024-03-14"
    }
  ]);

  const [newComment, setNewComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleReaction = (commentId: string, type: "like" | "dislike") => {
    setComments(prevComments =>
      prevComments.map(comment => {
        if (comment.id === commentId) {
          if (comment.userReaction === type) {
            return {
              ...comment,
              [`${type}s`]: comment[`${type}s`] - 1,
              userReaction: null
            };
          } else {
            const oldReaction = comment.userReaction;
            return {
              ...comment,
              likes:
                type === "like"
                  ? comment.likes + 1
                  : oldReaction === "like"
                  ? comment.likes - 1
                  : comment.likes,
              dislikes:
                type === "dislike"
                  ? comment.dislikes + 1
                  : oldReaction === "dislike"
                  ? comment.dislikes - 1
                  : comment.dislikes,
              userReaction: type
            };
          }
        }
        return comment;
      })
    );
  };

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    // Aquí iría la lógica para enviar el comentario al backend
    const newCommentObj: Comment = {
      id: Date.now().toString(),
      text: newComment.trim(),
      author: "Usuario Actual", // Esto debería venir del contexto de autenticación
      likes: 0,
      dislikes: 0,
      userReaction: null,
      date: new Date().toISOString().split('T')[0]
    };

    setComments(prev => [newCommentObj, ...prev]);
    setNewComment("");
    setIsSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>Comentarios</Text>

      <ScrollView style={styles.commentsList}>
        {comments.map(comment => (
          <View key={comment.id} style={styles.commentContainer}>
            <View style={styles.commentHeader}>
              <Text style={styles.author}>{comment.author}</Text>
              <Text style={styles.date}>{formatDate(comment.date)}</Text>
            </View>
            <Text style={styles.commentText}>{comment.text}</Text>
            <View style={styles.reactionsContainer}>
              <View style={styles.reactionGroup}>
                <IconButton
                  icon={
                    comment.userReaction === "like"
                      ? "thumb-up"
                      : "thumb-up-outline"
                  }
                  size={20}
                  onPress={() => handleReaction(comment.id, "like")}
                  iconColor={
                    comment.userReaction === "like"
                      ? COLORS.primary
                      : COLORS.textSecondary
                  }
                />
                <Text style={styles.reactionCount}>{comment.likes}</Text>
              </View>
              <View style={styles.reactionGroup}>
                <IconButton
                  icon={
                    comment.userReaction === "dislike"
                      ? "thumb-down"
                      : "thumb-down-outline"
                  }
                  size={20}
                  onPress={() => handleReaction(comment.id, "dislike")}
                  iconColor={
                    comment.userReaction === "dislike"
                      ? COLORS.error
                      : COLORS.textSecondary
                  }
                />
                <Text style={styles.reactionCount}>{comment.dislikes}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un comentario..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={500}
          onFocus={onCommentFocus}
        />
        <Button
          mode="contained"
          onPress={handleSubmitComment}
          disabled={!newComment.trim() || isSubmitting}
          loading={isSubmitting}
          style={styles.submitButton}
        >
          Comentar
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24, // Más espacio como en otros formularios
    backgroundColor: COLORS.background, // Fondo consistente con toda la app
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 24,
    color: COLORS.text,
    textAlign: "center", // Más profesional y armónico
  },
  commentsList: {
    flex: 1,
  },
  commentContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16, // Más redondeado como modales y botones
    padding: 16,
    marginBottom: 16,
    // Sombra más suave y consistente
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  author: {
    fontWeight: "700",
    color: COLORS.primary, // Color principal para destacar autor
    fontSize: 16,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontStyle: "italic",
  },
  commentText: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 12,
    lineHeight: 22, // Mejor legibilidad
  },
  reactionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  reactionGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  reactionCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 4, // Separación más natural con el icono
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 16, // Consistente con bordes de tarjetas y modales
    padding: 12,
    marginTop: 16,
    // Sombra más suave y elevada
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48,
    maxHeight: 120,
    fontSize: 15,
    color: COLORS.text,
    textAlignVertical: "top",
  },
  submitButton: {
    alignSelf: "flex-end",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
});


export default CommentSection;