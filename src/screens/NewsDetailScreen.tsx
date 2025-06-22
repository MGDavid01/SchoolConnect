import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TouchableOpacity,
  Share,
} from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Text,
  IconButton,
  Chip,
} from "react-native-paper";
import { COLORS } from "../theme/theme";

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
interface NewsDetailScreenProps {
  route: {
    params: {
      post: Post;
      route: RouteProp<NewsStackParamList, 'NewsDetail'>;
      navigation: any;
    };
  };
}
import { RouteProp } from '@react-navigation/native';

const NewsDetailScreen: React.FC<NewsDetailScreenProps> = ({ route }) => {
  const { post } = route.params;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${post.title}\n\n${post.content}\n\nCompartido desde SchoolConnect UTT`,
        title: post.title,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const toggleSave = () => {
    setIsSaved(!isSaved);
    // Aquí se podría implementar la lógica para guardar en AsyncStorage
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        {post.imageUrl && <Card.Cover source={{ uri: post.imageUrl }} />}
        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>{post.title}</Title>
            <View style={styles.actions}>
              <IconButton
                icon={isSaved ? "bookmark" : "bookmark-outline"}
                size={24}
                onPress={toggleSave}
                iconColor={COLORS.primary}
              />
              <IconButton
                icon="share-variant"
                size={24}
                onPress={handleShare}
                iconColor={COLORS.primary}
              />
            </View>
          </View>

          <View style={styles.metadata}>
            <Chip style={styles.categoryChip}>{post.category}</Chip>
            <Text style={styles.date}>{post.date}</Text>
          </View>

          <View>
            <Paragraph
              style={styles.content}
              numberOfLines={isExpanded ? undefined : 3}
            >
              {post.content}
            </Paragraph>
            <TouchableOpacity onPress={toggleExpand} style={styles.expandButton}>
              <Text style={styles.expandText}>
                {isExpanded ? "Ver menos" : "Ver más"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
            <Title style={styles.sectionTitle}>Contacto</Title>

            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <IconButton icon="email" size={20} />
                <Text style={styles.contactText}>contacto@utt.edu.mx</Text>
              </View>
              <View style={styles.contactItem}>
                <IconButton icon="phone" size={20} />
                <Text style={styles.contactText}>+52 (664) 123-4567</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.authorInfo}>
              <IconButton icon="account" size={24} />
              <View style={styles.authorDetails}>
                <Text style={styles.authorName}>{post.author}</Text>
                <Text style={styles.authorRole}>
                  Departamento de Comunicación
                </Text>
              </View>
            </View>
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 8,
  },
  title: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
  },
  metadata: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.secondary,
    marginRight: 8,
  },
  content: {
    color: COLORS.text,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  date: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  expandButton: {
    marginTop: 4,
    alignSelf: "flex-start",
  },
  expandText: {
    color: COLORS.primary,
    fontWeight: "bold",
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
    marginBottom: 8,
  },
  contactInfo: {
    marginBottom: 8,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
    height: 32,
  },
  contactText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 0,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginVertical: 8,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 4,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.text,
  },
  authorRole: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
