import React, { useState, useRef, useEffect } from "react"
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
  Animated,
  TouchableWithoutFeedback // <-- Agregado
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Searchbar, Text, FAB, ActivityIndicator } from "react-native-paper"
import { COLORS } from "../theme/theme"
import NewsCard from "../components/NewsCard"
import { StackNavigationProp } from "@react-navigation/stack"
import { RootStackParamList } from "../navigation/types" // Asegúrate de tener definido tu tipo de navegación
import { API_URL } from "../constants/api"
import axios from "axios"
import { MaterialCommunityIcons } from '@expo/vector-icons'

type Category = "General" | "Académico" | "Cultural" | "Deportes" | "Tecnología"
type DateFilter = "newest" | "oldest"

import type { PostData } from '../navigation/types'; // Ajusta la ruta según tu estructura

interface DateFilterOption {
  label: string
  value: DateFilter
}

interface CategoryFilterOption {
  label: string
  value: Category | "Todas"
}

interface NewsScreenProps {
  navigation: StackNavigationProp<RootStackParamList, "News">
}

const defaultImages: Record<Category, string> = {
  General: "https://utt.edu.mx/wp-content/uploads/2023/05/UTT-scaled.jpg",
  Académico: "https://utt.edu.mx/wp-content/uploads/2023/05/Biblioteca-scaled.jpg",
  Cultural: "https://utt.edu.mx/wp-content/uploads/2023/05/Cultura-scaled.jpg",
  Deportes: "https://utt.edu.mx/wp-content/uploads/2023/05/Deportes-scaled.jpg",
  Tecnología: "https://utt.edu.mx/wp-content/uploads/2023/05/Laboratorios-scaled.jpg"
}

const ICON_SIZE = 18;

const NewsScreen: React.FC<NewsScreenProps> = ({ navigation }) => {
  const [posts, setPosts] = useState<PostData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [fadeAnim] = useState(new Animated.Value(1))
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  // Función para cargar noticias desde la base de datos
  const fetchNoticias = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true)
      const response = await axios.get(`${API_URL}/api/noticias`)
      const noticias = response.data

      const parsedPosts: PostData[] = noticias.map((noticia: any) => ({
        id: noticia._id,
        title: noticia.titulo,
        content: noticia.contenido,
        date: formatDate(noticia.fechaPublicacion),
        dateForSort: new Date(noticia.fechaPublicacion).getTime(), // Para ordenamiento
        author: noticia.autorID,
        category: "General" as Category, // Por defecto, ya que no hay categorías en el esquema
        imageUrl: noticia.imagenURL || defaultImages["General"],
        type: "news",
        likes: 0,
        dislikes: 0,
        comments: []
      }))

      // Fade out
      if (isRefresh) {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          setPosts(parsedPosts)
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start()
        })
      } else {
        setPosts(parsedPosts)
      }
    } catch (error) {
      console.error("Error al cargar noticias:", error)
    } finally {
      setLoading(false)
      setIsFirstLoad(false)
    }
  }

  // Función para formatear fechas en español
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }
    return date.toLocaleDateString('es-ES', options)
  }

  // Cargar noticias al montar el componente
  useEffect(() => {
    fetchNoticias()
  }, [])

  useEffect(() => {
  const interval = setInterval(() => {
    fetchNoticias(true)
  }, 60000)

  return () => clearInterval(interval)
}, [])

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateFilter>("newest")
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<Category | "Todas">("Todas")
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [filterType, setFilterType] = useState<"date" | "category" | null>(null)
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null)

  const inputRef = useRef<TextInput>(null)

  const filteredPosts = posts
    .filter(post => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategoryFilter === "Todas" || post.category === selectedCategoryFilter
      
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const dateA = (a as any).dateForSort || new Date(a.date).getTime()
      const dateB = (b as any).dateForSort || new Date(b.date).getTime()
      return selectedDateFilter === "newest" ? dateB - dateA : dateA - dateB
    })

  const dateFilters: DateFilterOption[] = [
    { label: "Más recientes", value: "newest" },
    { label: "Más antiguos", value: "oldest" }
  ]

  const categoryFilters: CategoryFilterOption[] = [
    { label: "Todas", value: "Todas" },
    { label: "General", value: "General" },
    { label: "Académico", value: "Académico" },
    { label: "Cultural", value: "Cultural" },
    { label: "Deportes", value: "Deportes" },
    { label: "Tecnología", value: "Tecnología" }
  ]

  const showFilterModal = (type: "date" | "category") => {
    setFilterType(type)
    setFilterModalVisible(true)
  }

  const hideFilterModal = () => {
    setFilterModalVisible(false)
    setFilterType(null)
  }

  const handleExpandPost = (postId: string) => {
    setExpandedPostId(expandedPostId === postId ? null : postId)
  }

  const handlePostPress = (post: PostData) => {
    navigation.navigate("NewsDetail", { post })
  }

  const getFilterLabel = () => {
    if (filterType === "date") {
      return selectedDateFilter === "newest" ? "Más recientes" : "Más antiguos"
    } else if (filterType === "category") {
      return selectedCategoryFilter === "Todas" ? "Todas las categorías" : selectedCategoryFilter
    }
    return ""
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchNoticias(true)
    setRefreshing(false)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={["top"]}>
      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Noticias</Text>
        <View style={styles.titleAccent} />
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchbarWrapper}>
          <Searchbar
            placeholder="Buscar noticias..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={{ textAlignVertical: 'center' }}
          />
        </View>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => showFilterModal("date")}
          >
            <MaterialCommunityIcons name="calendar" size={ICON_SIZE} color={COLORS.surface} style={{ marginRight: 4 }} />
            <Text style={styles.filterLabel}>
              {selectedDateFilter === "newest" ? "Más recientes" : "Más antiguos"}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => showFilterModal("category")}
          >
            <MaterialCommunityIcons name="shape" size={ICON_SIZE} color={COLORS.surface} style={{ marginRight: 4 }} />
            <Text style={styles.filterLabel}>
              {selectedCategoryFilter === "Todas" ? "Todas las categorías" : selectedCategoryFilter}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        enabled
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingTop: 8, paddingBottom: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {isFirstLoad && loading ? (
            <View style={styles.loadingContainer}>
              <MaterialCommunityIcons name="newspaper-variant-outline" size={48} color={COLORS.secondary} />
              <Text style={styles.loadingText}>Cargando noticias...</Text>
            </View>
          ) : filteredPosts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="emoticon-sad-outline" size={48} color={COLORS.secondary} />
              <Text style={styles.emptyText}>
                No se encontraron noticias
              </Text>
            </View>
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              {filteredPosts.map(post => (
                <View key={post.id} style={styles.newsCardWrapper}>
                  <NewsCard
                    title={post.title}
                    content={post.content}
                    date={post.date}
                    author={post.author}
                    category={post.category as Category}
                    imageUrl={post.imageUrl || defaultImages[post.category as Category]}
                    onViewMore={() => handlePostPress(post)}
                  />
                </View>
              ))}
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={hideFilterModal}
      >
        <TouchableWithoutFeedback onPress={hideFilterModal}>
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <View>
                <View style={styles.modalHandle} />
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    {filterType === "date" ? "Ordenar por fecha" : "Filtrar por categoría"}
                  </Text>
                  {filterType === "date" ? (
                    dateFilters.map(filter => (
                      <TouchableOpacity
                        key={filter.value}
                        onPress={() => {
                          setSelectedDateFilter(filter.value)
                          hideFilterModal()
                        }}
                        style={[
                          styles.modalOption,
                          selectedDateFilter === filter.value && styles.selectedModalOption
                        ]}
                      >
                        <Text style={[
                          styles.modalOptionText,
                          selectedDateFilter === filter.value && styles.selectedModalOptionText
                        ]}>
                          {filter.label}
                        </Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    categoryFilters.map(filter => (
                      <TouchableOpacity
                        key={filter.value}
                        onPress={() => {
                          setSelectedCategoryFilter(filter.value)
                          hideFilterModal()
                        }}
                        style={[
                          styles.modalOption,
                          selectedCategoryFilter === filter.value && styles.selectedModalOption
                        ]}
                      >
                        <Text style={[
                          styles.modalOptionText,
                          selectedCategoryFilter === filter.value && styles.selectedModalOptionText
                        ]}>
                          {filter.label}
                        </Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.surface,
    backgroundColor: COLORS.primary,
    textAlign: 'center',
    paddingVertical: 5,
    width: '100%',
  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginBottom: 0,
    paddingBottom: 0,
    elevation: 2,
  },
  titleAccent: {
    width: '40%',
    height: 3,
    backgroundColor: COLORS.secondary,
    marginTop: -2,
    marginBottom: 6,
    borderRadius: 2,
  },
  searchContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
    gap: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  searchbarWrapper: {
    marginBottom: 8,
  },
  searchbar: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    fontSize: 16,
    justifyContent: 'center',
    textAlignVertical: 'center',
    elevation: 2,
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingTop: 2,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    marginHorizontal: 4,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.secondary,
    elevation: 2,
  },
  filterLabel: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: 'bold',
    paddingHorizontal: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 40,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 40,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    minHeight: 180,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 14,
    borderRadius: 8,
    marginVertical: 2,
    paddingHorizontal: 8,
  },
  selectedModalOption: {
    backgroundColor: COLORS.primary + "20",
  },
  modalOptionText: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center',
  },
  selectedModalOptionText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  newsCardWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
})

export default NewsScreen