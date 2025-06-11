import React from "react"
import { FlatList, View, StyleSheet } from "react-native"
import NewsCard from "./NewsCard"
import BlogPostCard from "./BlogCard"
import ScholarshipCard from "./ScholarshipCard"
import { Text } from "react-native-paper"
import { COLORS } from "../theme/theme"

export default function UnifiedPostList({
  data,
  type, // "news" | "blog" | "scholarship"
  onItemPress,
  onToggleFavorite, // solo para becas
  emptyText = "No hay elementos para mostrar"
}) {
  const renderItem = ({ item }) => {
    if (type === "news") {
      return (
        <NewsCard
          {...item}
          onViewMore={() => onItemPress(item)}
        />
      )
    }
    if (type === "blog") {
      return (
        <BlogPostCard
          {...item}
          onViewMore={() => onItemPress(item)}
        />
      )
    }
    if (type === "scholarship") {
      return (
        <ScholarshipCard
          scholarship={item}
          onPress={onItemPress}
          onToggleFavorite={onToggleFavorite}
        />
      )
    }
    return null
  }

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{emptyText}</Text>
        </View>
      }
    />
  )
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 8
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    padding: 32
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16
  }
})
