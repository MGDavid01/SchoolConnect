import React from "react"
import { StyleSheet, View } from "react-native"
import { Card, Title, Paragraph, Chip, Text } from "react-native-paper"
import { COLORS } from "../theme/theme"
import { truncateForCard, truncateForTitle } from "../utils/textUtils"

// 1. Definir el tipo de props
type NewsCardProps = {
  title: string
  content: string
  date: string
  author: string
  category: string
  imageUrl: string
  onViewMore: () => void
  expanded?: boolean // <- necesario para evitar el error
  onExpand?: () => void // <- necesario para evitar el error
}

// 2. Usar props tipadas y exportar como componente funcional
const NewsCard: React.FC<NewsCardProps> = ({
  title,
  content,
  date,
  author,
  category,
  imageUrl,
  onViewMore
}) => {
  // Truncar el contenido para evitar desbordamiento
  const truncatedContent = truncateForCard(content)
  
  return (
    <Card style={styles.card} onPress={onViewMore} elevation={4}>
      <View style={styles.imageContainer}>
        <Card.Cover source={{ uri: imageUrl }} style={styles.cover} />
      </View>
              <View style={styles.titleWrapper}>
          <Title style={styles.title} numberOfLines={2} ellipsizeMode="tail">
            {truncateForTitle(title)}
          </Title>
        </View>
      <View style={styles.contentWrapper}>
        <Card.Content style={styles.content}>
          <Paragraph 
            style={styles.preview} 
            numberOfLines={3} 
            ellipsizeMode="tail"
            allowFontScaling={false}
          >
            {truncatedContent}
          </Paragraph>
          <View style={styles.footer}>
            <Text style={styles.date}>{date}</Text>
            <Chip style={styles.chipFooter} textStyle={styles.chipTextFooter}>
              {category}
            </Chip>
          </View>
        </Card.Content>
      </View>
    </Card>
  )
}

export default NewsCard

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  contentWrapper: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  imageContainer: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    overflow: 'hidden',
  },
  cover: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  content: {
    paddingTop: 8,
  },
  titleWrapper: {
    backgroundColor: COLORS.secondary,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    color: COLORS.surface,
    fontWeight: "bold",
    textAlign: 'center',
  },
  preview: {
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.text,
    marginBottom: 12,
    paddingTop: 4,
    textAlign: 'justify',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.07)",
  },
  author: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "bold",
    flex: 1,
  },
  date: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  chipFooter: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    elevation: 2,
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 0,
    justifyContent: 'center',
    alignContent: 'center',
  },
  chipTextFooter: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
})
