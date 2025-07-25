// components/CommentCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { COLORS } from "../theme/theme";

type CommentCardProps = {
  author: string;
  content: string;
  date: string;
};

const CommentCard: React.FC<CommentCardProps> = ({ author, content, date }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.author}>{author}</Text>
      <Text style={styles.content}>{content}</Text>
      <Text style={styles.date}>{date}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  author: {
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 4,
    fontSize: 14,
  },
  content: {
    color: COLORS.text,
    fontSize: 14,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "right",
  },
});

export default CommentCard;
