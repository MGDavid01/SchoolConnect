import React from "react"
import { FlatList, View, StyleSheet, ListRenderItem } from "react-native"
import NewsCard from "./NewsCard"
import BlogPostCard from "./BlogCard"
import ScholarshipCard from "./ScholarshipCard"
import { Text } from "react-native-paper"
import { COLORS } from "../theme/theme"
import { Comment } from "../types/blog"

// Define tipos para cada item según el tipo
type NewsItem = {
  id: string
  title: string
  content: string
  date: string
  author: string
  category: string
  imageUrl: string
}

type BlogItem = {
  id: string
  title: string
  content: string
  date: string
  author: string
  category: string
  imageUrl: string
  likes: number
  dislikes: number
  comments: Comment[]
  type: string
}


type ScholarshipItem = {
  id: string
  title: string
  description: string
  deadline: string
  amount: string
  institution: string
  type: string
  educationLevel: string
  imageUrl?: string
  isFavorite?: boolean
}

// Props para el componente UnifiedPostList
type UnifiedPostListProps = {
  data: NewsItem[] | BlogItem[] | ScholarshipItem[]
  type: "news" | "blog" | "scholarship"
  onItemPress: (item: any) => void
  onToggleFavorite?: (id: string) => void
  emptyText?: string
}

export default function UnifiedPostList({
  data,
  type,
  onItemPress,
  onToggleFavorite,
  emptyText = "No hay elementos para mostrar"
}: UnifiedPostListProps) {
  // Función renderItem tipada
  const renderItem: ListRenderItem<NewsItem | BlogItem | ScholarshipItem> = ({ item }) => {
    if (type === "news") {
      const newsItem = item as NewsItem
      return (
        <NewsCard
          {...newsItem}
          onViewMore={() => onItemPress(newsItem)}
        />
      )
    }
    if (type === "blog") {
      const blogItem = item as BlogItem
      return (
        <BlogPostCard
           post={blogItem}
  expanded={false} // o el valor real que uses
  userReaction={null} // o el valor real
  onExpand={() => {}} // función adecuada
          onViewMore={() => onItemPress(blogItem)}
            onReact={(reaction) => {
    // lógica de reacción (like/dislike)
  }}
  onComment={(comment) => {
    // lógica para agregar comentario
  }}
        />
      )
    }
    if (type === "scholarship") {
      const scholarshipItem = item as ScholarshipItem
      return (
        <ScholarshipCard
          scholarship={scholarshipItem}
          onPress={onItemPress}
          onToggleFavorite={onToggleFavorite ?? (() => {})}
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
