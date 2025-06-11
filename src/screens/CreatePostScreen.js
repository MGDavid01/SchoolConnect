import React, { useState } from "react"
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image
} from "react-native"
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  IconButton,
  Menu,
  Divider
} from "react-native-paper"
import { SafeAreaView } from "react-native-safe-area-context"
import { COLORS } from "../theme/theme"

const CATEGORIES = [
  "Anuncios",
  "Académico", 
  "General",
  "Deportes",
  "Cultural",
  "Tecnología",
  "Estudiantes"
]

export default function CreatePostScreen({ navigation }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [categoryMenuVisible, setCategoryMenuVisible] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!title.trim()) {
      newErrors.title = "El título es obligatorio"
    } else if (title.length < 10) {
      newErrors.title = "El título debe tener al menos 10 caracteres"
    } else if (title.length > 100) {
      newErrors.title = "El título no puede exceder 100 caracteres"
    }

    if (!content.trim()) {
      newErrors.content = "El contenido es obligatorio"
    } else if (content.length > 5000) {
      newErrors.content = "El contenido no puede exceder 5000 caracteres"
    }

    if (!selectedCategory) {
      newErrors.category = "Debes seleccionar una categoría"
    }

    if (imageUrl && !isValidUrl(imageUrl)) {
      newErrors.imageUrl = "La URL de la imagen no es válida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  const handleSave = () => {
    if (!validateForm()) {
      Alert.alert("Error", "Por favor corrige los errores en el formulario")
      return
    }

    const newPost = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      author: "Usuario Actual", // Esto debería venir del contexto de autenticación
      date: new Date().toISOString().split("T")[0],
      category: selectedCategory,
      imageUrl: imageUrl.trim() || null,
      likes: 0,
      dislikes: 0,
      comments: [],
      type: "blog"
    }

    // Aquí normalmente guardarías en la base de datos
    console.log("Nueva publicación creada:", newPost)
    
    Alert.alert(
      "Éxito", 
      "Tu publicación ha sido creada correctamente",
      [
        {
          text: "OK",
          onPress: () => navigation.goBack()
        }
      ]
    )
  }

  const handleDiscard = () => {
    if (title.trim() || content.trim()) {
      Alert.alert(
        "Descartar cambios",
        "¿Estás seguro de que quieres descartar los cambios?",
        [
          { text: "Cancelar", style: "cancel" },
          { 
            text: "Descartar", 
            style: "destructive",
            onPress: () => navigation.goBack()
          }
        ]
      )
    } else {
      navigation.goBack()
    }
  }

  const renderPreview = () => (
    <Card style={styles.previewCard}>
      <Card.Content>
        <Text style={styles.previewTitle}>{title || "Título de la publicación"}</Text>
        
        <View style={styles.previewMetadata}>
          <Text style={styles.previewAuthor}>Usuario Actual</Text>
          <Text style={styles.previewDate}>
            {new Date().toLocaleDateString('es-ES')}
          </Text>
        </View>

        {selectedCategory && (
          <Chip 
            style={styles.previewCategoryChip}
            textStyle={styles.previewCategoryText}
          >
            {selectedCategory}
          </Chip>
        )}

        {imageUrl && isValidUrl(imageUrl) && (
          <Image 
            source={{ uri: imageUrl }} 
            style={styles.previewImage}
            resizeMode="cover"
          />
        )}

        <Text style={styles.previewContent}>
          {content || "Contenido de la publicación..."}
        </Text>
      </Card.Content>
    </Card>
  )

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <IconButton
            icon="close"
            size={24}
            onPress={handleDiscard}
            iconColor={COLORS.text}
          />
          <Text style={styles.headerTitle}>
            {isPreviewMode ? "Vista Previa" : "Nueva Publicación"}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <IconButton
            icon={isPreviewMode ? "pencil" : "eye"}
            size={24}
            onPress={() => setIsPreviewMode(!isPreviewMode)}
            iconColor={COLORS.primary}
          />
          {!isPreviewMode && (
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              labelStyle={styles.saveButtonText}
            >
              Publicar
            </Button>
          )}
        </View>
      </View>

      <Divider />

      {isPreviewMode ? (
        <ScrollView style={styles.previewContainer}>
          {renderPreview()}
        </ScrollView>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardContainer}
        >
          <ScrollView style={styles.formContainer}>
            {/* Título */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Título *</Text>
              <TextInput
                style={[styles.input, errors.title && styles.inputError]}
                value={title}
                onChangeText={setTitle}
                placeholder="Escribe un título atractivo..."
                mode="outlined"
                maxLength={100}
                error={!!errors.title}
              />
              <View style={styles.inputFooter}>
                {errors.title && (
                  <Text style={styles.errorText}>{errors.title}</Text>
                )}
                <Text style={styles.characterCount}>{title.length}/100</Text>
              </View>
            </View>

            {/* Categoría */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoría *</Text>
              <Menu
                visible={categoryMenuVisible}
                onDismiss={() => setCategoryMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={[
                      styles.categorySelector,
                      errors.category && styles.inputError
                    ]}
                    onPress={() => setCategoryMenuVisible(true)}
                  >
                    <Text style={[
                      styles.categorySelectorText,
                      !selectedCategory && styles.placeholderText
                    ]}>
                      {selectedCategory || "Selecciona una categoría"}
                    </Text>
                    <IconButton
                      icon="chevron-down"
                      size={20}
                      iconColor={COLORS.textSecondary}
                    />
                  </TouchableOpacity>
                }
              >
                {CATEGORIES.map((category) => (
                  <Menu.Item
                    key={category}
                    onPress={() => {
                      setSelectedCategory(category)
                      setCategoryMenuVisible(false)
                    }}
                    title={category}
                  />
                ))}
              </Menu>
              {errors.category && (
                <Text style={styles.errorText}>{errors.category}</Text>
              )}
            </View>

            {/* URL de imagen (opcional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>URL de imagen (opcional)</Text>
              <TextInput
                style={[styles.input, errors.imageUrl && styles.inputError]}
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="https://ejemplo.com/imagen.jpg"
                mode="outlined"
                keyboardType="url"
                error={!!errors.imageUrl}
              />
              {errors.imageUrl && (
                <Text style={styles.errorText}>{errors.imageUrl}</Text>
              )}
              {imageUrl && isValidUrl(imageUrl) && (
                <Image 
                  source={{ uri: imageUrl }} 
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
              )}
            </View>

            {/* Contenido */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contenido *</Text>
              <TextInput
                style={[styles.contentInput, errors.content && styles.inputError]}
                value={content}
                onChangeText={setContent}
                placeholder="Escribe el contenido de tu publicación..."
                mode="outlined"
                multiline
                numberOfLines={10}
                maxLength={5000}
                error={!!errors.content}
              />
              <View style={styles.inputFooter}>
                {errors.content && (
                  <Text style={styles.errorText}>{errors.content}</Text>
                )}
                <Text style={styles.characterCount}>{content.length}/5000</Text>
              </View>
            </View>

            {/* Información adicional */}
            <Card style={styles.infoCard}>
              <Card.Content>
                <Text style={styles.infoTitle}>💡 Consejos para una buena publicación:</Text>
                <Text style={styles.infoText}>
                  • Usa un título claro y descriptivo{'\n'}
                  • Estructura tu contenido con párrafos{'\n'}
                  • Añade una imagen si es relevante{'\n'}
                  • Revisa la ortografía antes de publicar
                </Text>
              </Card.Content>
            </Card>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: COLORS.surface
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.text,
    marginLeft: 8
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center"
  },
  saveButton: {
    marginLeft: 8,
    backgroundColor: COLORS.primary
  },
  saveButtonText: {
    color: "white",
    fontWeight: "600"
  },
  keyboardContainer: {
    flex: 1
  },
  formContainer: {
    flex: 1,
    padding: 16
  },
  inputGroup: {
    marginBottom: 20
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 8
  },
  input: {
    backgroundColor: COLORS.surface
  },
  contentInput: {
    backgroundColor: COLORS.surface,
    minHeight: 120
  },
  inputError: {
    borderColor: COLORS.error || "#ff0000",
    borderWidth: 1
  },
  inputFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4
  },
  errorText: {
    color: COLORS.error || "#ff0000",
    fontSize: 12,
    flex: 1
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textSecondary
  },
  categorySelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 56
  },
  categorySelectorText: {
    fontSize: 16,
    color: COLORS.text,
    flex: 1
  },
  placeholderText: {
    color: COLORS.textSecondary
  },
  imagePreview: {
    width: "100%",
    height: 200,
    marginTop: 8,
    borderRadius: 8
  },
  infoCard: {
    backgroundColor: COLORS.surface,
    marginTop: 20,
    marginBottom: 20
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 8
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20
  },
  previewContainer: {
    flex: 1,
    padding: 16
  },
  previewCard: {
    backgroundColor: COLORS.surface,
    elevation: 4
  },
  previewTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8
  },
  previewMetadata: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  previewAuthor: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "500"
  },
  previewDate: {
    fontSize: 14,
    color: COLORS.textSecondary
  },
  previewCategoryChip: {
    alignSelf: "flex-start",
    marginBottom: 12,
    backgroundColor: COLORS.primary
  },
  previewCategoryText: {
    color: "white",
    fontSize: 12
  },
  previewImage: {
    width: "100%",
    height: 200,
    marginBottom: 12,
    borderRadius: 8
  },
  previewContent: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text
  }
})