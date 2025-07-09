import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Card, Text, IconButton } from "react-native-paper";
import { COLORS } from "../theme/theme";
// BlogCard.tsx
import { BlogPost } from "../types/blog"; // ajusta la ruta si es necesario

interface BlogCardProps {
  post: BlogPost;
  expanded: boolean;
  userReaction: "like" | "dislike" | null;
  onExpand: (postId: string) => void;
  onReact: (postId: string, reaction: "like" | "dislike") => void;
  onComment: (post: BlogPost) => void;
  onViewMore: () => void;
}

const BlogCard = ({
  post,
  expanded,
  userReaction,
  onExpand,
  onReact,
  onComment,
}: BlogCardProps) => (
  <Card style={styles.card}>
    <Card.Content>
      <Text style={styles.title}>{post.title}</Text>
      <View style={styles.headerRow}>
        <Text style={styles.author}>{post.author}</Text>
        <Text style={styles.author}>{post.date}</Text>
      </View>
    </Card.Content>

    {post.imageUrl && (
      <Card.Cover source={{ uri: post.imageUrl }} style={styles.image} />
    )}

    <Card.Content>
      <Text style={styles.content} numberOfLines={expanded ? undefined : 3}>
        {post.content}
      </Text>
      <TouchableOpacity
        onPress={() => onExpand(post.id)}
        style={styles.expandBtn}
      >
        <Text style={styles.expandText}>
          {expanded ? "Ver menos" : "Ver más"}
        </Text>
      </TouchableOpacity>

      <View style={styles.actionsRow}>
        <View style={styles.reactionsRow}>
          <TouchableOpacity
            style={styles.reactionBtn}
            onPress={() => {
              console.log("🟡 Botón LIKE presionado:", post.id);
              onReact(post.id, "like") } }
          >
            <IconButton
              icon={userReaction === "like" ? "thumb-up" : "thumb-up-outline"}
              size={20}
              iconColor={
                userReaction === "like" ? COLORS.primary : COLORS.textSecondary
              }
            />
            <Text style={styles.reactionCount}>{post.likes}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reactionBtn}
            onPress={() => { console.log("🟡 Botón DISLIKE presionado:", post.id);
              onReact(post.id, "dislike")} }
          >
            <IconButton
              icon={
                userReaction === "dislike"
                  ? "thumb-down"
                  : "thumb-down-outline"
              }
              size={20}
              iconColor={
                userReaction === "dislike" ? COLORS.error : COLORS.textSecondary
              }
            />
            <Text style={styles.reactionCount}>{post.dislikes}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.commentBtn}
            onPress={() => onComment(post)}
          >
            <IconButton
              icon="comment-outline"
              size={20}
              iconColor={COLORS.textSecondary}
            />
            <Text style={styles.reactionCount}>
              {post.comments.length}{" "}
              {post.comments.length === 1 ? "comentario" : "comentarios"}
            </Text>
          </TouchableOpacity>
        </View>
        <IconButton
          icon="share-variant"
          size={20}
          onPress={() => {
            /* Implementar compartir */
          }}
        />
      </View>
    </Card.Content>
  </Card>
);

const styles = StyleSheet.create({
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  author: {
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
  expandBtn: {
    alignSelf: "flex-start",
    marginTop: 4,
    marginBottom: 8,
  },
  expandText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  reactionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  commentBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  reactionCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default BlogCard;