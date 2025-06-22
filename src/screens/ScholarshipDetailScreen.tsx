import React from "react";
import { ScrollView, StyleSheet, View, Share, Linking } from "react-native";
import {
  Card,
  Title,
  Paragraph,
  Text,
  IconButton,
  Button,
  List
} from "react-native-paper";
import { COLORS } from "../theme/theme";
import { RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types"; // Asegúrate de tener definido tu tipo de navegación

import { Scholarship } from "../navigation/types";

import { ScholarshipStackParamList } from "../navigation/types";



// Definición de tipos para la beca

// Props para el componente
interface ScholarshipDetailScreenProps {
  route: RouteProp<ScholarshipStackParamList, "ScholarshipDetail">;
  navigation: StackNavigationProp<ScholarshipStackParamList, "ScholarshipDetail">;
}



const ScholarshipDetailScreen: React.FC<ScholarshipDetailScreenProps> = ({ route }) => {
  const { scholarship } = route.params;

  /**
   * Comparte los detalles de la beca
   */
  const handleShare = async (): Promise<void> => {
    try {
      await Share.share({
        message: `¡Mira esta beca!\n\n${scholarship.title}\n\n${scholarship.description}\n\nFecha límite: ${scholarship.deadline}\nMonto: ${scholarship.amount}\n\nCompartido desde SchoolConnect UTT`,
        title: scholarship.title
      });
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  /**
   * Maneja la aplicación a la beca
   */
  const handleApply = (): void => {
    // Aquí se implementaría la lógica para aplicar a la beca
    console.log("Aplicando a la beca:", scholarship.title);
    // Ejemplo: navigation.navigate("ApplyScholarship", { scholarshipId: scholarship.id });
  };

  /**
   * Calcula los días restantes hasta la fecha límite
   * @returns Número de días restantes (negativo si ya pasó la fecha)
   */
  const daysUntilDeadline = (): number => {
    const deadline = new Date(scholarship.deadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const deadlineDays = daysUntilDeadline();
  const isUrgent = deadlineDays <= 7 && deadlineDays > 0;
  const isExpired = deadlineDays <= 0;

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
            <IconButton 
              icon="share-variant" 
              size={24} 
              onPress={handleShare} 
              accessibilityLabel="Compartir beca"
            />
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
                accessibilityLabel={`Fecha límite: ${scholarship.deadline}`}
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
                  key={`requirement-${index}`}
                  title={requirement}
                  left={props => <List.Icon {...props} icon="check-circle" color={COLORS.primary} />}
                  titleStyle={styles.requirementText}
                  style={styles.listItem}
                  accessibilityLabel={`Requisito ${index + 1}: ${requirement}`}
                />
              ))}
            </List.Section>
          </View>

          <View style={styles.contactSection}>
            <Title style={styles.sectionTitle}>Contacto</Title>
            <List.Item
              title="Departamento de Becas"
              description="becas@utt.edu.mx"
              left={props => <List.Icon {...props} icon="email" color={COLORS.primary} />}
              onPress={() => Linking.openURL("mailto:becas@utt.edu.mx")}
              style={styles.listItem}
              accessibilityLabel="Contactar por correo electrónico"
            />
            <List.Item
              title="Teléfono"
              description="+52 (664) 123-4567"
              left={props => <List.Icon {...props} icon="phone" color={COLORS.primary} />}
              onPress={() => Linking.openURL("tel:+526641234567")}
              style={styles.listItem}
              accessibilityLabel="Llamar al teléfono de contacto"
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
            accessibilityLabel={isExpired ? "Convocatoria cerrada" : "Aplicar a la beca"}
          >
            {isExpired ? "Convocatoria cerrada" : "Aplicar ahora"}
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

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
});

export default ScholarshipDetailScreen;