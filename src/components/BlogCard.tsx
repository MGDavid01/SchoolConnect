import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet, Image, Modal } from "react-native";
import { Card, Text, IconButton, Avatar, Menu, Divider } from "react-native-paper";
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
  onEdit?: (post: BlogPost) => void;
  onDelete?: (postId: string) => void;
  isOwner?: boolean;
  isSaved?: boolean;
  onToggleSave?: (postId: string, isSaved: boolean) => void;
  extraActions?: boolean;
}


const BlogCard = ({
  post,
  expanded,
  userReaction,
  onExpand,
  onReact,
  onComment,
  comentarioCount,
  onEdit,
  onDelete,
  isOwner = false,
  isSaved = false,
  onToggleSave,
}: BlogCardProps) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const avatarLetter = post.author?.charAt(0).toUpperCase() || "?";
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleEdit = () => {
    closeMenu();
    onEdit?.(post);
  };

  const handleDelete = () => {
    closeMenu();
    onDelete?.(post.id);
  };

  const openImageModal = () => {
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
  };


  return (
    <Card style={styles.card} elevation={4}>
      {/* Header con autor, fecha y menú */}
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <Avatar.Text
            size={40}
            label={avatarLetter}
            style={styles.avatar}
            color="white"
          />
          <View style={styles.authorDetails}>
            <Text style={styles.author}>{post.author}</Text>
            <Text style={styles.date}>{post.date}</Text>
            <View style={styles.categoryContainer}>
              <Text style={styles.category}>
                {post.visibilidad === "todos" ? "Público" : "Grupo"} • {post.tipo}
              </Text>
            </View>
          </View>
        </View>
        
        {isOwner && (
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <IconButton
                icon="dots-horizontal"
                size={24}
                onPress={openMenu}
                iconColor={COLORS.textSecondary}
                style={styles.menuButton}
              />
            }
          >
            <Menu.Item
              onPress={handleEdit}
              title="Editar"
              leadingIcon="pencil"
              titleStyle={styles.menuItemText}
            />
            <Divider />
            <Menu.Item
              onPress={handleDelete}
              title="Eliminar"
              leadingIcon="delete"
              titleStyle={[styles.menuItemText, styles.deleteMenuItem]}
            />
          </Menu>
        )}
      </View>

      {/* Contenido */}
      <Card.Content style={styles.content}>

        <Text style={styles.contentText} numberOfLines={expanded ? undefined : 4}>
          {post.content}
        </Text>

        {/* Botón Ver más - se muestra si el texto tiene más de 4 líneas */}
        {post.content.length > 150 && (
          <TouchableOpacity onPress={() => onExpand(post.id)} style={styles.expandBtn}>
            <Text style={styles.expandText}>
              {expanded ? "Ver menos" : "Ver más"}
            </Text>
          </TouchableOpacity>
        )}

      </Card.Content>

      {/* Imagen */}
      {post.imageUrl && (
        <View style={styles.imageContainer}>
          <TouchableOpacity 
            onPress={openImageModal} 
            style={styles.imageTouchable}
            activeOpacity={0.8}
          >
            <Image source={{ uri: post.imageUrl }} style={styles.image} />
          </TouchableOpacity>
        </View>
      )}

      {/* Botones de interacción */}
      <View style={styles.actionsContainer}>
        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onReact(post.id, "like")}
          >
            <IconButton
              icon={userReaction === "like" ? "heart" : "heart-outline"}
              size={20}
              iconColor={userReaction === "like" ? COLORS.primary : COLORS.textSecondary}
            />
            <Text style={[
              styles.actionCount,
              userReaction === "like" && styles.activeActionCount
            ]}>
              {post.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onReact(post.id, "dislike")}
          >
            <IconButton
              icon={userReaction === "dislike" ? "thumb-down" : "thumb-down-outline"}
              size={20}
              iconColor={userReaction === "dislike" ? COLORS.error : COLORS.textSecondary}
            />
            <Text style={[
              styles.actionCount,
              userReaction === "dislike" && styles.activeActionCount
            ]}>
              {post.dislikes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => onComment(post)}
          >
            <IconButton 
              icon="comment-outline" 
              size={20} 
              iconColor={COLORS.primary} 
            />
            <Text style={styles.actionCount}>{comentarioCount}</Text>
          </TouchableOpacity>

          {onToggleSave && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onToggleSave(post.id, isSaved || false)}
            >
              <IconButton
                icon={isSaved ? "bookmark" : "bookmark-outline"}
                size={20}
                iconColor={isSaved ? COLORS.primary : COLORS.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Modal para ver imagen completa */}
      <Modal
        visible={imageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeImageModal}
      >
        <View style={styles.fullImageModalOverlay}>
          <TouchableOpacity 
            style={styles.fullImageModalCloseButton} 
            onPress={closeImageModal}
          >
            <IconButton
              icon="close"
              size={28}
              iconColor={COLORS.surface}
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.fullImageContainer} 
            onPress={closeImageModal}
            activeOpacity={1}
          >
            <Image 
              source={{ uri: post.imageUrl || '' }} 
              style={styles.fullImage} 
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: "hidden",
    maxWidth: 500,           
    alignSelf: "center",    
    width: "100%",
    position: "relative", 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  authorInfo: {
    flexDirection: "row",
    flex: 1,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  authorDetails: {
    marginLeft: 12,
    flex: 1,
  },
  author: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 2,
  },
  date: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  category: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: "500",
  },
  menuButton: {
    margin: 0,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
    marginBottom: 8,
    lineHeight: 24,
  },
  contentText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
    textAlign: "justify",
  },
  expandBtn: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  expandText: {
    color: COLORS.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  imageContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 500,
    maxHeight: 500,
    borderRadius: 12,
    resizeMode: "cover",
  },
  imageTouchable: {
    position: "relative",
  },
  fullImageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImageModalCloseButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  fullImageContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  actionsContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  actionCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500",
    marginLeft: 4,
  },
  activeActionCount: {
    color: COLORS.primary,
    fontWeight: "600",
  },
  menuItemText: {
    fontSize: 14,
    color: COLORS.text,
  },
  deleteMenuItem: {
    color: COLORS.error,
  },
  reactionBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
});

export default BlogCard;
