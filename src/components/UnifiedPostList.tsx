import React from "react"
import { FlatList, ListRenderItem, StyleSheet, View, Text } from "react-native"
import { COLORS } from "../theme/theme"
import NewsCard from "./NewsCard"
import BlogPostCard from "./BlogCard"
import ScholarshipCard from "./ScholarshipCard"
import { Comment } from "../types/blog"

// Importar el tipo Scholarship desde ScholarshipCard
interface Scholarship {
  _id: string;
  titulo: string;
  descripcion: string;
  requisitos: string[];
  promedioMinimo?: number;
  sinReprobadas?: boolean;
  documentos?: string[];
  condicionEspecial?: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: string;
  activo: boolean;
  autorID: string;
  fechaPublicacion: string;
  monto?: number;
  institucion?: string;
}

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
  guardada: any
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
  comentarioCount={blogItem.comments?.length || 0}
        />
      )
    }
    if (type === "scholarship") {
      const scholarshipItem = item as ScholarshipItem
      // Mapear ScholarshipItem a Scholarship
      const scholarship: Scholarship = {
        _id: scholarshipItem.id,
        titulo: scholarshipItem.title,
        descripcion: scholarshipItem.description,
        requisitos: [], // Placeholder, needs actual data
        fechaInicio: scholarshipItem.deadline,
        fechaFin: scholarshipItem.deadline,
        tipo: scholarshipItem.type,
        activo: true,
        autorID: "placeholder", // Placeholder
        fechaPublicacion: new Date().toISOString(),
        monto: parseFloat(scholarshipItem.amount) || undefined,
        institucion: scholarshipItem.institution
      }
      return (
        <ScholarshipCard
          scholarship={scholarship}
          onPress={onItemPress}
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
