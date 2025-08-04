import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  Clipboard,
} from "react-native";
import {
  Card,
  Title,
  Chip,
} from "react-native-paper";
import { COLORS } from "../theme/theme";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import NotificationToast from '../components/NotificationToast';

// Define el tipo de datos que esperas para "post"
interface Post {
  title: string;
  content: string;
  imageUrl?: string;
  category: string;
  date: string;
  author: string;
}

import { NewsStackParamList } from '../navigation/types'; // ajusta la ruta si es diferente


// Define el tipo de props que recibe el componente (navigation y route vienen de React Navigation)
type NewsDetailScreenProps = {
  route: RouteProp<NewsStackParamList, 'NewsDetail'>;
  navigation?: any; // Opcional si no lo usas
};

import { RouteProp } from '@react-navigation/native';

const NewsDetailScreen: React.FC<NewsDetailScreenProps> = ({ route }) => {
  const { post } = route.params;
  const [isExpanded, setIsExpanded] = useState(false);
  const [notification, setNotification] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await Clipboard.setString(text);
      setNotification({
        visible: true,
        title: '¡Copiado!',
        message: `${type} copiado al portapapeles`,
        type: 'success',
      });
    } catch (error) {
      setNotification({
        visible: true,
        title: 'Error',
        message: 'No se pudo copiar al portapapeles',
        type: 'error',
      });
    }
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, visible: false }));
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          {post.imageUrl && (
            <View style={styles.imageContainer}>
              <Card.Cover source={{ uri: post.imageUrl }} />
              <View style={styles.chipOverlay}>
                <Chip 
                  style={styles.categoryChip}
                  textStyle={styles.categoryChipText}
                >
                  {post.category}
                </Chip>
              </View>
            </View>
          )}
          <Card.Content style={styles.cardContent}>
            <View style={styles.header}>
              <Title style={styles.title}>{post.title}</Title>
            </View>

            <View style={styles.metadata}>
              <Text style={styles.date}>{post.date}</Text>
            </View>

            <View style={styles.contentContainer}>
              <Text
                style={styles.content}
                numberOfLines={isExpanded ? undefined : 3}
                ellipsizeMode="tail"
                allowFontScaling={false}
              >
                {post.content}
              </Text>
              {post.content.length > 150 && (
                <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
                  <Text style={styles.expandText}>
                    {isExpanded ? "Ver menos" : "Ver más"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.infoSection}>
              <Title style={styles.sectionTitle}>Contacto</Title>

              <View style={styles.contactInfo}>
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => copyToClipboard('contacto@utt.edu.mx', 'Email')}
                >
                  <MaterialCommunityIcons 
                    name="email-outline" 
                    size={20} 
                    color={COLORS.primary} 
                    style={styles.contactIcon}
                  />
                  <Text style={styles.contactText}>contacto@utt.edu.mx</Text>
                  <MaterialCommunityIcons 
                    name="content-copy" 
                    size={16} 
                    color={COLORS.primary} 
                  />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.contactItem}
                  onPress={() => copyToClipboard('+52 (664) 123-4567', 'Teléfono')}
                >
                  <MaterialCommunityIcons 
                    name="phone-outline" 
                    size={20} 
                    color={COLORS.primary} 
                    style={styles.contactIcon}
                  />
                  <Text style={styles.contactText}>+52 (664) 123-4567</Text>
                  <MaterialCommunityIcons 
                    name="content-copy" 
                    size={16} 
                    color={COLORS.primary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>
      
      <NotificationToast
        visible={notification.visible}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        duration={1500}
        onHide={hideNotification}
      />
    </View>
  );
};

export default NewsDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  card: {
    margin: 12,
    elevation: 4,
    backgroundColor: COLORS.surface,
  },
  cardContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  chipOverlay: {
    position: 'absolute',
    top: 160,
    left: 0,
    zIndex: 1,
  },
  header: {
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 26,
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 12,
  },
  categoryChip: {
    backgroundColor: COLORS.secondary,
    marginRight: 8,
    elevation: 3,
  },
  categoryChipText: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  contentContainer: {
    marginBottom: 16,
  },
  content: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'justify',
    flexWrap: 'wrap',
  },
  date: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  expandButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  expandText: {
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 14,
  },
  infoSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  sectionTitle: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 12,
  },
  contactInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 6,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: COLORS.primary,
    elevation: 2,
  },
  contactIcon: {
    marginRight: 8,
  },
  contactText: {
    fontSize: 13,
    color: COLORS.text,
    flex: 1,
  },
});
