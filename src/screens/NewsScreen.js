import React, { useState, useRef } from "react"
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Searchbar, Text, FAB } from "react-native-paper"
import { COLORS } from "../theme/theme"
import NewsCard from "../components/NewsCard"

const categories = [
  "General",
  "Académico",
  "Cultural",
  "Deportes",
  "Tecnología"
]

const defaultImages = {
  General: "https://utt.edu.mx/wp-content/uploads/2023/05/UTT-scaled.jpg",
  Académico:
    "https://utt.edu.mx/wp-content/uploads/2023/05/Biblioteca-scaled.jpg",
  Cultural: "https://utt.edu.mx/wp-content/uploads/2023/05/Cultura-scaled.jpg",
  Deportes: "https://utt.edu.mx/wp-content/uploads/2023/05/Deportes-scaled.jpg",
  Tecnología:
    "https://utt.edu.mx/wp-content/uploads/2023/05/Laboratorios-scaled.jpg"
}

export default NewsScreen = ({ navigation }) => {
  const [posts, setPosts] = useState([
    {
      id: "1",
      title: "Nuevo Laboratorio de Robótica en la UTT",
      content:
        "La Universidad Tecnológica de Tijuana inaugura su nuevo laboratorio de robótica equipado con tecnología de última generación. Este espacio permitirá a los estudiantes desarrollar proyectos innovadores...",
      date: "2023-12-20",
      author: "Departamento de Comunicación",
      category: "Tecnología",
      imageUrl: defaultImages["Tecnología"],
      type: "news",
      likes: 0,
      dislikes: 0,
      comments: []
    },
    {
      id: "2",
      title: "Convocatoria para Becas 2024",
      content:
        "Se abre la convocatoria para las becas del periodo 2024. Los estudiantes interesados pueden aplicar a través del portal institucional...",
      date: "2023-12-18",
      author: "Departamento de Becas",
      category: "Académico",
      imageUrl: defaultImages["Académico"],
      type: "news",
      likes: 0,
      dislikes: 0,
      comments: []
    },
    {
      id: "3",
      title: "Festival Cultural de Primavera",
      content:
        "La UTT se prepara para su Festival Cultural de Primavera con diversas actividades artísticas y culturales. No te pierdas las presentaciones de danza, música y teatro...",
      date: "2023-12-15",
      author: "Coordinación Cultural",
      category: "Cultural",
      imageUrl: defaultImages["Cultural"],
      type: "news",
      likes: 0,
      dislikes: 0,
      comments: []
    }
  ])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedDateFilter, setSelectedDateFilter] = useState("newest")
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [filterType, setFilterType] = useState(null)
  const [expandedPostId, setExpandedPostId] = useState(null)

  const inputRef = useRef(null)

  const filteredPosts = posts
    .filter(post => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory =
        !selectedCategory || post.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return selectedDateFilter === "newest" ? dateB - dateA : dateA - dateB
    })

  const dateFilters = [
    { label: "Más recientes", value: "newest" },
    { label: "Más antiguos", value: "oldest" }
  ]

  const showFilterModal = type => {
    setFilterType(type)
    setFilterModalVisible(true)
  }

  const hideFilterModal = () => {
    setFilterModalVisible(false)
    setFilterType(null)
  }

  const handleExpandPost = postId => {
    setExpandedPostId(expandedPostId === postId ? null : postId)
  }

  const handlePostPress = post => {
    navigation.navigate("NewsDetail", { post })
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar noticias..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => showFilterModal("category")}
          >
            <Text style={styles.filterLabel}>{selectedCategory || "Todas"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => showFilterModal("date")}
          >
            <Text style={styles.filterLabel}>
              {selectedDateFilter === "newest" ? "Más recientes" : "Más antiguos"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          {filteredPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No se encontraron noticias
              </Text>
            </View>
          ) : (
            filteredPosts.map(post => (
              <NewsCard
                key={post.id}
                title={post.title}
                content={post.content}
                date={post.date}
                author={post.author}
                category={post.category}
                imageUrl={post.imageUrl || defaultImages[post.category]}
                onViewMore={() => handlePostPress(post)}
                expanded={expandedPostId === post.id}
                onExpand={() => handleExpandPost(post.id)}
              />
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="slide"
        onRequestClose={hideFilterModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {filterType === "category" ? (
              <>
                <Text style={styles.modalTitle}>Selecciona una categoría</Text>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory(null)
                    hideFilterModal()
                  }}
                  style={styles.modalOption}
                >
                  <Text style={styles.modalOptionText}>Todas las categorías</Text>
                </TouchableOpacity>
                {categories.map(category => (
                  <TouchableOpacity
                    key={category}
                    onPress={() => {
                      setSelectedCategory(
                        category === selectedCategory ? null : category
                      )
                      hideFilterModal()
                    }}
                    style={styles.modalOption}
                  >
                    <Text style={styles.modalOptionText}>{category}</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>Ordenar por fecha</Text>
                {dateFilters.map(filter => (
                  <TouchableOpacity
                    key={filter.value}
                    onPress={() => {
                      setSelectedDateFilter(filter.value)
                      hideFilterModal()
                    }}
                    style={styles.modalOption}
                  >
                    <Text style={styles.modalOptionText}>{filter.label}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  searchContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 8,
    elevation: 4
  },
  searchbar: {
    elevation: 0,
    backgroundColor: COLORS.background
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 4,
    gap: 8
  },
  filterButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    marginHorizontal: 4,
    padding: 8,
    alignItems: "center"
  },
  filterLabel: {
    color: COLORS.surface,
    fontSize: 12
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16
  },
  modalOption: {
    paddingVertical: 12
  },
  modalOptionText: {
    fontSize: 16,
    color: COLORS.text
  }
})
