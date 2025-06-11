import React from "react"
import { StyleSheet, View } from "react-native"
import {
  Card,
  Title,
  Paragraph,
  Text,
  IconButton,
  Chip
} from "react-native-paper"
import { COLORS } from "../theme/theme"

export default ScholarshipCard = ({ scholarship, onPress, onToggleFavorite }) => {
  const daysUntilDeadline = () => {
    const deadline = new Date(scholarship.deadline)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const deadlineDays = daysUntilDeadline()
  const isUrgent = deadlineDays <= 7 && deadlineDays > 0
  const isExpired = deadlineDays <= 0

  return (
    <Card style={styles.card} onPress={() => onPress(scholarship)}>
      {scholarship.imageUrl && (
        <View style={styles.imageContainer}>
          <Card.Cover
            source={{ uri: scholarship.imageUrl }}
            style={styles.image}
          />
          <View style={styles.chipContainer}>
            <Chip
              style={[styles.chip, { backgroundColor: COLORS.secondary }]}
              textStyle={styles.chipText}
            >
              {scholarship.type}
            </Chip>
            <Chip
              style={[styles.chip, { backgroundColor: COLORS.primary }]}
              textStyle={styles.chipText}
            >
              {scholarship.educationLevel}
            </Chip>
            <Chip
              style={[
                styles.chip,
                {
                  backgroundColor: isExpired
                    ? COLORS.error
                    : isUrgent
                    ? "#FFA000"
                    : "#4CAF50"
                }
              ]}
              textStyle={styles.chipText}
            >
              {isExpired
                ? "Expirada"
                : isUrgent
                ? `¡${deadlineDays} días!`
                : `${deadlineDays} días`}
            </Chip>
          </View>
        </View>
      )}
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.title}>{scholarship.title}</Title>
          <IconButton
            icon={scholarship.isFavorite ? "star" : "star-outline"}
            iconColor={
              scholarship.isFavorite ? COLORS.secondary : COLORS.textSecondary
            }
            size={24}
            onPress={() => onToggleFavorite(scholarship.id)}
          />
        </View>

        <Paragraph style={styles.description} numberOfLines={3}>
          {scholarship.description}
        </Paragraph>

        <View style={styles.footer}>
          <Text style={styles.amount}>Monto: {scholarship.amount}</Text>
          <Text style={styles.institution}>{scholarship.institution}</Text>
        </View>
      </Card.Content>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden"
  },
  imageContainer: {
    position: "relative",
    height: 180
  },
  image: {
    height: "100%"
  },
  chipContainer: {
    position: "absolute",
    bottom: 12,
    left: 12,
    flexDirection: "row",
    gap: 8
  },
  chip: {
    borderRadius: 20,
    elevation: 3,
    height: 28,
    alignItems: "center",
    justifyContent: "center"
  },
  chipText: {
    height: "100%",
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: "bold"
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginRight: 8,
    lineHeight: 24
  },
  description: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.text
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)"
  },
  amount: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.secondary
  },
  institution: {
    fontSize: 12,
    color: COLORS.textSecondary
  }
})