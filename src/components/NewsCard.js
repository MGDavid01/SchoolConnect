import React from "react"
import { StyleSheet, View } from "react-native"
import { Card, Title, Paragraph, Chip, Text } from "react-native-paper"
import { COLORS } from "../theme/theme"

export default NewsCard = ({
  title,
  content,
  date,
  author,
  category,
  imageUrl,
  onViewMore
}) => {
  return (
    <Card style={styles.card} onPress={onViewMore}>
      <View style={styles.imageContainer}>
        <Card.Cover source={{ uri: imageUrl }} style={styles.cover} />
        <Chip style={styles.chip} textStyle={styles.chipText}>
          {category}
        </Chip>
      </View>
      <Card.Content style={styles.content}>
        <Title style={styles.title} numberOfLines={2}>
          {title}
        </Title>
        <Paragraph style={styles.preview} numberOfLines={3}>
          {content}
        </Paragraph>
        <View style={styles.footer}>
          <Text style={styles.author} numberOfLines={1}>
            Por {author}
          </Text>
          <Text style={styles.date}>{date}</Text>
        </View>
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: COLORS.surface,
    overflow: "hidden"
  },
  imageContainer: {
    position: "relative",
    height: 180
  },
  cover: {
    height: "100%"
  },
  chip: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: COLORS.secondary,
    borderRadius: 20,
    elevation: 3
  },
  chipText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: "bold"
  },
  content: {
    padding: 16
  },
  title: {
    fontSize: 18,
    lineHeight: 24,
    color: COLORS.primary,
    fontWeight: "bold",
    marginBottom: 8
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text,
    marginBottom: 12
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)"
  },
  author: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "bold",
    flex: 1
  },
  date: {
    fontSize: 12,
    color: COLORS.textSecondary
  }
})