import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from "@react-navigation/native";
import { Button, Card, Chip, Menu, IconButton, Avatar } from "react-native-paper";
import { useAuth } from "../contexts/AuthContext";
import { COLORS } from "../theme/theme";
import axios from "axios";
import { API_URL } from "../constants/api";
import { Snackbar } from "react-native-paper";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CreatePostScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [contenido, setContenido] = useState("");
  const [tipo, setTipo] = useState<"General" | "Ayuda" | "Pregunta" | "Aviso">("General");
  const [visibilidad, setVisibilidad] = useState<"todos" | "grupo">("todos");
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<any>(null);
  const [imageChanged, setImageChanged] = useState(false);
  const [tipoMenuVisible, setTipoMenuVisible] = useState(false);
  const [visibilidadMenuVisible, setVisibilidadMenuVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarType, setSnackbarType] = useState<"success" | "error">("success");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const avatarLetter = user?.nombre?.charAt(0).toUpperCase() || "U";

  const handlePublicar = async () => {
    if (!contenido.trim() && !selectedImage) {
      setSnackbarMessage("Escribe algo o agrega una imagen para publicar");
      setSnackbarType("error");
      setSnackbarVisible(true);
      return;
    }

    setIsPublishing(true);

    try {
      let imageUrl = null;

      // Subir imagen a Cloudinary solo si hay una imagen seleccionada
      if (selectedImageFile && imageChanged) {
        setIsUploadingImage(true);
        try {
          const formData = new FormData();
          formData.append('image', selectedImageFile);

          const uploadResponse = await axios.post(`${API_URL}/api/upload/upload-image`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          if (uploadResponse.data.success) {
            imageUrl = uploadResponse.data.imageUrl;
          } else {
            throw new Error('Error al subir imagen');
          }
        } catch (uploadError) {
          console.error('Error al subir imagen:', uploadError);
          setSnackbarMessage("Error al subir la imagen. Intenta de nuevo.");
          setSnackbarType("error");
          setSnackbarVisible(true);
          setIsPublishing(false);
          setIsUploadingImage(false);
          return;
        } finally {
          setIsUploadingImage(false);
        }
      }

      const nuevaPublicacion = {
        contenido: contenido.trim(),
        tipo,
        visibilidad,
        imagenURL: imageUrl,
        autorID: user?._id,
      };

      const response = await axios.post(`${API_URL}/api/publicaciones`, nuevaPublicacion);

      if (response.status === 201) {
        setSnackbarMessage("¡Publicación creada exitosamente!");
        setSnackbarType("success");
        setSnackbarVisible(true);

        // Limpiar el formulario
        setContenido("");
        setTipo("General");
        setVisibilidad("todos");
        setSelectedImage(null);
        setSelectedImageFile(null);
        setImageChanged(false);

        setTimeout(() => {
          setSnackbarVisible(false);
          navigation.goBack();
        }, 2000);
      }
    } catch (error) {
      console.error("Error al crear publicación:", error);
      setSnackbarMessage("No se pudo crear la publicación. Intenta de nuevo.");
      setSnackbarType("error");
      setSnackbarVisible(true);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCancel = () => {
    if (contenido.trim() || selectedImage) {
      Alert.alert(
        "Descartar publicación",
        "¿Estás seguro de que quieres descartar esta publicación?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Descartar", style: "destructive", onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permisos requeridos',
        'Necesitamos acceso a tu galería para seleccionar imágenes.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets[0]) {
        // Guardar la imagen localmente sin subir a Cloudinary
        setSelectedImage(result.assets[0].uri);
        setSelectedImageFile({
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'image.jpg',
        });
        setImageChanged(true); // Marcar que la imagen cambió
        setSnackbarMessage("Imagen seleccionada");
        setSnackbarType("success");
        setSnackbarVisible(true);
      }
    } catch (error) {
      console.error('Error al seleccionar imagen:', error);
      setSnackbarMessage("Error al seleccionar la imagen. Intenta de nuevo.");
      setSnackbarType("error");
      setSnackbarVisible(true);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setSelectedImageFile(null);
    setImageChanged(true); // Marcar que la imagen cambió (se removió)
  };

  const openImageModal = () => {
    setImageModalVisible(true);
  };

  const closeImageModal = () => {
    setImageModalVisible(false);
  };

  // Manejo del StatusBar
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Asegurar que el StatusBar esté configurado correctamente al volver a la pantalla
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={COLORS.primary}
        translucent={false}
        animated={true}
      />
      {/* Header estilo Facebook */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <MaterialCommunityIcons name="close" size={24} color={COLORS.surface} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear publicación</Text>
        </View>
                 <TouchableOpacity 
           onPress={handlePublicar} 
           style={[
             styles.publishButton,
             (!contenido.trim() && !selectedImage || isPublishing) && styles.publishButtonDisabled
           ]}
           disabled={(!contenido.trim() && !selectedImage) || isPublishing}
         >
                     <Text style={[
             styles.publishButtonText,
             (!contenido.trim() && !selectedImage || isPublishing) && styles.publishButtonTextDisabled
           ]}>
             {isPublishing ? "Publicando..." : "Publicar"}
           </Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Área de usuario */}
          <View style={styles.userSection}>
            <Avatar.Text
              size={48}
              label={avatarLetter}
              style={styles.userAvatar}
              color="white"
            />
                         <View style={styles.userInfo}>
               <Text style={styles.userName}>
                 {user?.nombre} {user?.apellidoPaterno}
               </Text>
               <View style={styles.selectorsRow}>
                 <TouchableOpacity 
                   style={styles.visibilitySelector}
                   onPress={() => setVisibilidadMenuVisible(true)}
                 >
                   <MaterialCommunityIcons 
                     name={visibilidad === "todos" ? "earth" : "account-group"} 
                     size={16} 
                     color={COLORS.primary} 
                   />
                   <Text style={styles.selectorText}>
                     {visibilidad === "todos" ? "Público" : "Solo grupo"}
                   </Text>
                   <MaterialCommunityIcons name="chevron-down" size={16} color={COLORS.textSecondary} />
                 </TouchableOpacity>
                 
                 <TouchableOpacity 
                   style={styles.typeSelectorSmall}
                   onPress={() => setTipoMenuVisible(true)}
                 >
                   <MaterialCommunityIcons 
                     name={getTypeIcon(tipo)} 
                     size={16} 
                     color={COLORS.primary} 
                   />
                   <Text style={styles.selectorText}>
                     {tipo}
                   </Text>
                   <MaterialCommunityIcons name="chevron-down" size={16} color={COLORS.textSecondary} />
                 </TouchableOpacity>
               </View>
             </View>
          </View>

          {/* Área de texto principal */}
          <View style={styles.textAreaContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="¿En qué piensas?"
              placeholderTextColor={COLORS.textSecondary}
              multiline
              value={contenido}
              onChangeText={setContenido}
              textAlignVertical="top"
              autoFocus
            />
          </View>

          {/* Área de imagen */}
          {selectedImage && (
            <View style={styles.imagePreviewContainer}>
              <TouchableOpacity 
                onPress={openImageModal} 
                style={styles.imagePreviewTouchable}
                activeOpacity={0.8}
              >
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                {/* Botón cambiar imagen en esquina inferior izquierda */}
                <TouchableOpacity 
                  style={styles.changeImageButton} 
                  onPress={pickImage}
                  disabled={isUploadingImage}
                >
                  <MaterialCommunityIcons 
                    name={isUploadingImage ? "loading" : "image-edit"} 
                    size={16} 
                    color={COLORS.primary} 
                  />
                  <Text style={styles.changeImageText}>
                    {isUploadingImage ? "Subiendo..." : "Cambiar"}
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
              <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                <MaterialCommunityIcons name="close-circle" size={24} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          )}

          {/* Botón para agregar imagen */}
          <View style={styles.imageActionsContainer}>
            {!selectedImage ? (
              <TouchableOpacity 
                style={styles.addImageButton} 
                onPress={pickImage}
                disabled={isUploadingImage}
              >
                <MaterialCommunityIcons 
                  name={isUploadingImage ? "loading" : "image-plus"} 
                  size={20} 
                  color={COLORS.primary} 
                />
                <Text style={styles.addImageText}>
                  {isUploadingImage ? "Subiendo..." : "Agregar imagen"}
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>

           {/* Modales para selectores */}
           <Modal
             visible={tipoMenuVisible}
             transparent
             animationType="fade"
             onRequestClose={() => setTipoMenuVisible(false)}
           >
             <TouchableWithoutFeedback onPress={() => setTipoMenuVisible(false)}>
               <View style={styles.modalOverlay}>
                 <TouchableWithoutFeedback onPress={() => {}}>
                   <View style={styles.modalContent}>
                     <Text style={styles.modalTitle}>Tipo de publicación</Text>
                     {[
                       { label: "General", value: "General", icon: "post" },
                       { label: "Ayuda", value: "Ayuda", icon: "help-circle" },
                       { label: "Pregunta", value: "Pregunta", icon: "help-circle-outline" },
                       { label: "Aviso", value: "Aviso", icon: "bell" }
                     ].map((item) => (
                       <TouchableOpacity
                         key={item.value}
                         style={[
                           styles.modalOption,
                           tipo === item.value && styles.selectedModalOption
                         ]}
                         onPress={() => {
                           setTipo(item.value as any);
                           setTipoMenuVisible(false);
                         }}
                       >
                         <MaterialCommunityIcons 
                           name={item.icon as any} 
                           size={20} 
                           color={tipo === item.value ? COLORS.primary : COLORS.textSecondary} 
                         />
                         <Text style={[
                           styles.modalOptionText,
                           tipo === item.value && styles.selectedModalOptionText
                         ]}>
                           {item.label}
                         </Text>
                       </TouchableOpacity>
                     ))}
                   </View>
                 </TouchableWithoutFeedback>
               </View>
             </TouchableWithoutFeedback>
           </Modal>

           <Modal
             visible={visibilidadMenuVisible}
             transparent
             animationType="fade"
             onRequestClose={() => setVisibilidadMenuVisible(false)}
           >
             <TouchableWithoutFeedback onPress={() => setVisibilidadMenuVisible(false)}>
               <View style={styles.modalOverlay}>
                 <TouchableWithoutFeedback onPress={() => {}}>
                   <View style={styles.modalContent}>
                     <Text style={styles.modalTitle}>Visibilidad</Text>
                     <TouchableOpacity
                       style={[
                         styles.modalOption,
                         visibilidad === "todos" && styles.selectedModalOption
                       ]}
                       onPress={() => {
                         setVisibilidad("todos");
                         setVisibilidadMenuVisible(false);
                       }}
                     >
                       <MaterialCommunityIcons 
                         name="earth" 
                         size={20} 
                         color={visibilidad === "todos" ? COLORS.primary : COLORS.textSecondary} 
                       />
                       <Text style={[
                         styles.modalOptionText,
                         visibilidad === "todos" && styles.selectedModalOptionText
                       ]}>
                         Público
                       </Text>
                     </TouchableOpacity>
                     <TouchableOpacity
                       style={[
                         styles.modalOption,
                         visibilidad === "grupo" && styles.selectedModalOption
                       ]}
                       onPress={() => {
                         setVisibilidad("grupo");
                         setVisibilidadMenuVisible(false);
                       }}
                     >
                       <MaterialCommunityIcons 
                         name="account-group" 
                         size={20} 
                         color={visibilidad === "grupo" ? COLORS.primary : COLORS.textSecondary} 
                       />
                       <Text style={[
                         styles.modalOptionText,
                         visibilidad === "grupo" && styles.selectedModalOptionText
                       ]}>
                         Solo grupo
                       </Text>
                     </TouchableOpacity>
                   </View>
                 </TouchableWithoutFeedback>
               </View>
             </TouchableWithoutFeedback>
                      </Modal>

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
                 <MaterialCommunityIcons name="close" size={28} color={COLORS.surface} />
               </TouchableOpacity>
               <TouchableOpacity 
                 style={styles.fullImageContainer} 
                 onPress={closeImageModal}
                 activeOpacity={1}
               >
                 <Image 
                   source={{ uri: selectedImage || '' }} 
                   style={styles.fullImage} 
                   resizeMode="contain"
                 />
               </TouchableOpacity>
             </View>
           </Modal>

           {/* Contador de caracteres */}
          {contenido.length > 0 && (
            <View style={styles.characterCount}>
              <Text style={styles.characterCountText}>
                {contenido.length} caracteres
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        style={{
          backgroundColor: snackbarType === "success" ? COLORS.primary : COLORS.error,
        }}
        action={{
          label: "OK",
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
};

// Función helper para obtener el icono del tipo
const getTypeIcon = (tipo: string) => {
  switch (tipo) {
    case "General": return "post";
    case "Ayuda": return "help-circle";
    case "Pregunta": return "help-circle-outline";
    case "Aviso": return "bell";
    default: return "post";
  }
};

export default CreatePostScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingTop: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  cancelButton: {
    padding: 4,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.surface,
  },
  publishButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  publishButtonDisabled: {
    backgroundColor: COLORS.textSecondary + "30",
  },
  publishButtonText: {
    color: COLORS.surface,
    fontWeight: "700",
    fontSize: 14,
  },
  publishButtonTextDisabled: {
    color: COLORS.surface + "80",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  userAvatar: {
    backgroundColor: COLORS.primary,
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
     userName: {
     fontSize: 16,
     fontWeight: "600",
     color: COLORS.text,
     marginBottom: 8,
   },
   selectorsRow: {
     flexDirection: "row",
     gap: 8,
   },
   visibilitySelector: {
     flexDirection: "row",
     alignItems: "center",
     backgroundColor: COLORS.primary + "15",
     paddingHorizontal: 8,
     paddingVertical: 4,
     borderRadius: 12,
     alignSelf: "flex-start",
     borderWidth: 1,
     borderColor: COLORS.primary + "30",
   },
   typeSelectorSmall: {
     flexDirection: "row",
     alignItems: "center",
     backgroundColor: COLORS.secondary + "15",
     paddingHorizontal: 8,
     paddingVertical: 4,
     borderRadius: 12,
     alignSelf: "flex-start",
     borderWidth: 1,
     borderColor: COLORS.secondary + "30",
   },
   selectorText: {
     fontSize: 13,
     color: COLORS.primary,
     fontWeight: "500",
     marginHorizontal: 4,
   },

  
  textAreaContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
  },
  textInput: {
    fontSize: 18,
    color: COLORS.text,
    lineHeight: 24,
    minHeight: 120,
    textAlignVertical: "top",
    padding: 0,
  },
  
   characterCount: {
     paddingHorizontal: 16,
     paddingVertical: 8,
     backgroundColor: COLORS.surface,
     borderTopWidth: 1,
     borderTopColor: "rgba(0,0,0,0.05)",
   },
   characterCountText: {
     fontSize: 12,
     color: COLORS.textSecondary,
     textAlign: "right",
   },
   menuItemText: {
     fontSize: 14,
     color: COLORS.text,
   },
   modalOverlay: {
     flex: 1,
     backgroundColor: "rgba(0,0,0,0.5)",
     justifyContent: "center",
     alignItems: "center",
   },
   modalContent: {
     backgroundColor: COLORS.surface,
     borderRadius: 16,
     padding: 24,
     margin: 20,
     minWidth: 280,
     elevation: 8,
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 4 },
     shadowOpacity: 0.25,
     shadowRadius: 8,
   },
   modalTitle: {
     fontSize: 18,
     fontWeight: "600",
     color: COLORS.primary,
     marginBottom: 16,
     textAlign: "center",
   },
   modalOption: {
     flexDirection: "row",
     alignItems: "center",
     paddingVertical: 12,
     paddingHorizontal: 16,
     borderRadius: 8,
     marginVertical: 2,
   },
   selectedModalOption: {
     backgroundColor: COLORS.primary + "15",
     borderWidth: 1,
     borderColor: COLORS.primary + "30",
   },
   modalOptionText: {
     fontSize: 16,
     color: COLORS.text,
     marginLeft: 12,
     flex: 1,
   },
   selectedModalOptionText: {
     color: COLORS.primary,
     fontWeight: "600",
   },
   imagePreviewContainer: {
     marginHorizontal: 16,
     marginVertical: 8,
     borderRadius: 12,
     overflow: "hidden",
     position: "relative",
   },
   imagePreview: {
     width: "100%",
     height: 250,
     borderRadius: 12,
     resizeMode: "cover",
   },
   removeImageButton: {
     position: "absolute",
     top: 8,
     right: 8,
     backgroundColor: COLORS.surface,
     borderRadius: 12,
     padding: 2,
     elevation: 3,
     shadowColor: "#000",
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.25,
     shadowRadius: 4,
   },
   imageActionsContainer: {
     paddingHorizontal: 16,
     paddingVertical: 8,
   },
   addImageButton: {
     flexDirection: "row",
     alignItems: "center",
     backgroundColor: COLORS.surface,
     paddingHorizontal: 16,
     paddingVertical: 12,
     borderRadius: 12,
     borderWidth: 2,
     borderColor: COLORS.primary + "30",
     borderStyle: "dashed",
   },
   addImageText: {
     fontSize: 16,
     color: COLORS.primary,
     fontWeight: "500",
     marginLeft: 8,
   },
   addImageButtonHidden: {
     backgroundColor: COLORS.background,
     borderColor: COLORS.textSecondary + "30",
   },
   addImageTextHidden: {
     color: COLORS.textSecondary,
   },
   imagePreviewTouchable: {
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
   changeImageButton: {
     position: "absolute",
     bottom: 8,
     left: 8,
     backgroundColor: COLORS.surface,
     borderRadius: 12,
     padding: 4,
     flexDirection: "row",
     alignItems: "center",
     borderWidth: 1,
     borderColor: COLORS.primary + "30",
   },
   changeImageText: {
     fontSize: 12,
     color: COLORS.primary,
     fontWeight: "500",
     marginLeft: 4,
   },
});

