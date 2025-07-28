import React from "react";
import { View, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Card, Text, IconButton, Avatar } from "react-native-paper";
import { COLORS } from "../theme/theme";
import { BlogPost } from "../types/blog";

interface BlogCardProps {
  post: BlogPost;
  expanded: boolean;
  userReaction: "like" | "dislike" | null;
  onExpand: (postId: string) => void;
  onReact: (postId: string, reaction: "like" | "dislike") => void;
  onComment: (post: BlogPost) => void;
  onViewMore: () => void;
  comentarioCount: number;
}

const BlogCard = ({
  post,
  expanded,
  userReaction,
  onExpand,
  onReact,
  onComment,
  comentarioCount,
}: BlogCardProps) => {
  const avatarLetter = post.author?.charAt(0).toUpperCase() || "?";

  return (
    <Card style={styles.card}>
      {/* Header con autor y fecha */}
      <View style={styles.header}>
        <Avatar.Text
          size={36}
          label={avatarLetter}
          style={styles.avatar}
          color="white"
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.author}>{post.author}</Text>
          <Text style={styles.date}>{post.date}</Text>
        </View>
      </View>

      {/* Imagen */}
      {post.imageUrl && (
        <Image source={{ uri: post.imageUrl }} style={styles.image} />
      )}

      {/* Contenido */}
      <Card.Content>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.content} numberOfLines={expanded ? undefined : 3}>
          {post.content}
        </Text>

        {/* Botón Ver más */}
        <TouchableOpacity onPress={() => onExpand(post.id)} style={styles.expandBtn}>
          <Text style={styles.expandText}>{expanded ? "Ver menos" : "Ver más"}</Text>
        </TouchableOpacity>

        {/* Acciones */}
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.reactionBtn}
            onPress={() => onReact(post.id, "like")}
          >
            <IconButton
              icon={userReaction === "like" ? "heart" : "heart-outline"}
              size={22}
              iconColor={userReaction === "like" ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={styles.reactionCount}>{post.likes}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reactionBtn}
            onPress={() => onReact(post.id, "dislike")}
          >
            <IconButton
              icon={userReaction === "dislike" ? "thumb-down" : "thumb-down-outline"}
              size={22}
              iconColor={userReaction === "dislike" ? COLORS.error : COLORS.textSecondary}
            />
            <Text style={styles.reactionCount}>{post.dislikes}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.reactionBtn} onPress={() => onComment(post)}>
            <IconButton icon="comment-outline" size={22} iconColor={COLORS.primary} />
            <Text style={styles.reactionCount}>{comentarioCount}</Text>
          </TouchableOpacity>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 10,
    marginHorizontal: 16,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  author: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.text,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  image: {
    height: 180,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 10,
  },
  content: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginTop: 4,
  },
  expandBtn: {
    marginTop: 6,
  },
  expandText: {
    color: COLORS.primary,
    fontWeight: "500",
  },
  actionsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  reactionBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
  },
  reactionCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
});

export default BlogCard;
