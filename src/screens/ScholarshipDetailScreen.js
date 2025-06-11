import React from "react"
import { ScrollView, StyleSheet, View, Share, Linking } from "react-native"
import {
  Card,
  Title,
  Paragraph,
  Text,
  IconButton,
  Button,
  List
} from "react-native-paper"
import { COLORS } from "../theme/theme"

export default ScholarshipDetailScreen = ({ route }) => {
  const { scholarship } = route.params

  const handleShare = async () => {
    try {
      await Share.share({
        message: `¡Mira esta beca!\n\n${scholarship.title}\n\n${scholarship.description}\n\nFecha límite: ${scholarship.deadline}\nMonto: ${scholarship.amount}\n\nCompartido desde SchoolConnect UTT`,
        title: scholarship.title
      })
    } catch (error) {
      console.error(error)
    }
  }

  const handleApply = () => {
    // Aquí se implementaría la lógica para aplicar a la beca
    // Por ahora solo mostraremos un mensaje en consola
    console.log("Aplicando a la beca:", scholarship.title)
  }

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
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        {scholarship.imageUrl && (
          <Card.Cover
            source={{ uri: scholarship.imageUrl }}
            style={styles.image}
          />
        )}

        <Card.Content>
          <View style={styles.header}>
            <Title style={styles.title}>{scholarship.title}</Title>
            <IconButton icon="share-variant" size={24} onPress={handleShare} />
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tipo de beca:</Text>
              <Text style={styles.value}>{scholarship.type}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Nivel educativo:</Text>
              <Text style={styles.value}>{scholarship.educationLevel}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Monto:</Text>
              <Text style={[styles.value, styles.amount]}>
                {scholarship.amount}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Institución:</Text>
              <Text style={styles.value}>{scholarship.institution}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha límite:</Text>
              <Text
                style={[
                  styles.value,
                  isExpired ? styles.expired : isUrgent ? styles.urgent : null
                ]}
              >
                {scholarship.deadline}
                {isExpired
                  ? " (Expirada)"
                  : isUrgent
                  ? ` (¡${deadlineDays} días restantes!)`
                  : ` (${deadlineDays} días restantes)`}
              </Text>
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <Title style={styles.sectionTitle}>Descripción</Title>
            <Paragraph style={styles.description}>
              {scholarship.description}
            </Paragraph>
          </View>

          <View style={styles.requirementsSection}>
            <Title style={styles.sectionTitle}>Requisitos</Title>
            <List.Section>
              {scholarship.requirements.map((requirement, index) => (
                <List.Item
                  key={index}
                  title={requirement}
                  left={props => <List.Icon {...props} icon="check-circle" />}
                  titleStyle={styles.requirementText}
                  style={styles.listItem}
                />
              ))}
            </List.Section>
          </View>

          <View style={styles.contactSection}>
            <Title style={styles.sectionTitle}>Contacto</Title>
            <List.Item
              title="Departamento de Becas"
              description="becas@utt.edu.mx"
              left={props => <List.Icon {...props} icon="email" />}
              onPress={() => Linking.openURL("mailto:becas@utt.edu.mx")}
              style={styles.listItem}
            />
            <List.Item
              title="Teléfono"
              description="+52 (664) 123-4567"
              left={props => <List.Icon {...props} icon="phone" />}
              onPress={() => Linking.openURL("tel:+526641234567")}
              style={styles.listItem}
            />
          </View>
        </Card.Content>

        <Card.Actions style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleApply}
            style={[styles.applyButton, isExpired && styles.expiredButton]}
            labelStyle={styles.buttonLabel}
            disabled={isExpired}
          >
            {isExpired ? "Convocatoria cerrada" : "Aplicar ahora"}
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  card: {
    margin: 8,
    elevation: 4,
    backgroundColor: COLORS.surface
  },
  image: {
    height: 200
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginRight: 8
  },
  infoSection: {
    marginTop: 16,
    backgroundColor: COLORS.background,
    padding: 16,
    borderRadius: 8
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1
  },
  value: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "500",
    flex: 2,
    textAlign: "right"
  },
  amount: {
    color: COLORS.secondary,
    fontWeight: "bold"
  },
  expired: {
    color: COLORS.error
  },
  urgent: {
    color: "#FFA000"
  },
  descriptionSection: {
    marginTop: 24
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 8
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.text
  },
  requirementsSection: {
    marginTop: 12
  },
  requirementText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 18
  },
  contactSection: {
    marginTop: 12
  },
  listItem: {
    paddingVertical: 4
  },
  actions: {
    padding: 16,
    justifyContent: "center"
  },
  applyButton: {
    flex: 1,
    backgroundColor: COLORS.primary
  },
  expiredButton: {
    backgroundColor: COLORS.error
  },
  buttonLabel: {
    color: COLORS.surface
  }
})
