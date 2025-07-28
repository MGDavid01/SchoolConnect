import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/theme";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";

type CommentCardProps = {
  author: string;
  content: string;
  date: string;
};

const CommentCard: React.FC<CommentCardProps> = ({ author, content, date }) => {
  return (
    <View style={styles.card}>
      {/* Encabezado: Autor + Fecha */}
      <View style={styles.header}>
        <View style={styles.authorRow}>
          <Icon name="account-circle" size={22} color={COLORS.primary} />
          <Text style={styles.author}>{author}</Text>
        </View>
        <Text style={styles.date}>{date}</Text>
      </View>

      {/* Contenido del comentario */}
      <Text style={styles.content}>{content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  author: {
    fontWeight: "700",
    color: COLORS.text,
    fontSize: 15,
    marginLeft: 6,
  },
  content: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});

export default CommentCard;
