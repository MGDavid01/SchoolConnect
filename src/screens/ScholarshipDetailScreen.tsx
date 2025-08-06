import React, { useState, useEffect } from "react";
import { ScrollView, StyleSheet, View, Share, Linking, ActivityIndicator } from "react-native";
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
import { MaterialCommunityIcons } from '@expo/vector-icons';

import axios from 'axios';
import { API_URL } from '../constants/api';

interface Scholarship {
  _id: string;
  titulo: string;
  descripcion: string;
  requisitos: string[];
  promedioMinimo?: number;
  sinReprobadas?: boolean;
  documentos?: string[];
  condicionEspecial?: string;
  fechaInicio: string;
  fechaFin: string;
  tipo: string;
  activo: boolean;
  autorID: string;
  fechaPublicacion: string;
  url?: string; // Nuevo campo para la URL de aplicación
  monto?: string; // Monto de la beca
  institucion?: string; // Institución que ofrece la beca
  imageUrl?: string; // URL de la imagen de la beca
}

import { ScholarshipStackParamList } from "../navigation/types";



// Definición de tipos para la beca

// Props para el componente
interface ScholarshipDetailScreenProps {
  route: RouteProp<ScholarshipStackParamList, "ScholarshipDetail">;
  navigation: StackNavigationProp<ScholarshipStackParamList, "ScholarshipDetail">;
}



const ScholarshipDetailScreen: React.FC<ScholarshipDetailScreenProps> = ({ route }) => {
  const { id } = route.params;
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScholarship = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/becas/${id}`);
        setScholarship(res.data);
      } catch (err) {
        setScholarship(null);
      } finally {
        setLoading(false);
      }
    };
    fetchScholarship();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <MaterialCommunityIcons 
            name="school" 
            size={80} 
            color={COLORS.primary} 
            style={styles.loadingIcon}
          />
          <ActivityIndicator 
            size="large" 
            color={COLORS.primary} 
            style={styles.spinner}
          />
          <Text style={styles.loadingTitle}>Cargando beca</Text>
          <Text style={styles.loadingSubtitle}>Obteniendo información detallada...</Text>
        </View>
      </View>
    );
  }
  
  if (!scholarship) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons 
          name="alert-circle-outline" 
          size={80} 
          color={COLORS.error} 
          style={styles.errorIcon}
        />
        <Text style={styles.errorTitle}>No se encontró la beca</Text>
        <Text style={styles.errorSubtitle}>La beca o programa solicitado no está disponible o ha sido removido.</Text>
      </View>
    );
  }

  /**
   * Comparte los detalles de la beca
   */
  const handleShare = async (): Promise<void> => {
    try {
      let message = `¡Mira este apoyo!\n`;
      message += `${scholarship.titulo}\n`;
      if (scholarship.monto) message += `Con apoyo de: $${scholarship.monto}\n`;
      if (scholarship.institucion) message += `Por parte de ${scholarship.institucion}\n`;
      message += `Fecha límite: ${formatFecha(scholarship.fechaFin)}\n`;
      if (scholarship.url) message += `\nAplica aquí: ${scholarship.url}\n`;
      message += `\nCompartido desde SchoolConnect UTT`;
      await Share.share({
        message,
        title: scholarship.titulo
      });
    } catch (error) {
      console.error("Error al compartir:", error);
    }
  };

  /**
   * Maneja la aplicación a la beca
   */
  const handleApply = (): void => {
    if (scholarship.url) {
      Linking.openURL(scholarship.url);
    } else {
      // Puedes mostrar un mensaje o deshabilitar el botón
      alert('No hay URL de aplicación disponible para esta beca.');
    }
  };

  /**
   * Calcula los días restantes hasta la fecha límite
   * @returns Número de días restantes (negativo si ya pasó la fecha)
   */
  const daysUntilDeadline = (): number => {
    const deadline = new Date(scholarship.fechaFin);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  /**
   * Calcula los días hasta el inicio de la beca
   * @returns Número de días hasta el inicio (negativo si ya comenzó)
   */
  const daysUntilStart = (): number => {
    const start = new Date(scholarship.fechaInicio);
    const today = new Date();
    const diffTime = start.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const deadlineDays = daysUntilDeadline();
  const startDays = daysUntilStart();
  const isNotStarted = startDays > 0;
  const isUrgent = deadlineDays <= 7 && deadlineDays > 0 && !isNotStarted;
  const isExpired = deadlineDays <= 0;

  // Utilidad para capitalizar la primera letra
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  // Utilidad para formatear fecha
  const formatFecha = (fecha: string) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
  };

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
            <Title style={styles.title}>{scholarship.titulo}</Title>
            <IconButton 
              icon="share-variant" 
              size={24} 
              onPress={handleShare} 
              accessibilityLabel="Compartir beca"
            />
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Tipo:</Text>
              <Text style={styles.value}>{capitalize(scholarship.tipo)}</Text>
            </View>
            {scholarship.monto && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Monto:</Text>
                <Text style={[styles.value, styles.amount]}>${scholarship.monto}</Text>
              </View>
            )}
            {scholarship.institucion && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Institución:</Text>
                <Text style={styles.value}>{scholarship.institucion}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.label}>Fecha límite:</Text>
              <Text style={styles.value}>{formatFecha(scholarship.fechaFin)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Estado:</Text>
              <Text style={[
                styles.value, 
                isExpired ? styles.expired : 
                isNotStarted ? styles.notStarted : 
                isUrgent ? styles.urgent : 
                styles.active
              ]}>
                {isExpired ? 'Expirada' : 
                 isNotStarted ? `Inicia en ${startDays} días` : 
                 isUrgent ? `${deadlineDays} días restantes` : 
                 `${deadlineDays} días restantes`}
              </Text>
            </View>
            {scholarship.condicionEspecial && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Condición especial:</Text>
                <Text style={styles.value}>{scholarship.condicionEspecial}</Text>
              </View>
            )}
          </View>

          <View style={styles.descriptionSection}>
            <Title style={styles.sectionTitle}>Descripción</Title>
            <Paragraph style={styles.description}>
              {scholarship.descripcion}
            </Paragraph>
          </View>

          <View style={styles.requirementsSection}>
            <Title style={styles.sectionTitle}>Requisitos</Title>
            <List.Section>
              {scholarship.requisitos && scholarship.requisitos.length > 0 ? (
                scholarship.requisitos.map((requirement, index) => (
                  <List.Item
                    key={`requirement-${index}`}
                    title={requirement}
                    left={props => <List.Icon {...props} icon="check-circle" color={COLORS.primary} />}
                    titleStyle={styles.requirementText}
                    style={styles.listItem}
                    titleNumberOfLines={0}
                    accessibilityLabel={`Requisito ${index + 1}: ${requirement}`}
                  />
                ))
              ) : (
                <Text style={styles.noRequirements}>No hay requisitos específicos para esta beca.</Text>
              )}
            </List.Section>
          </View>

          {scholarship.documentos && scholarship.documentos.length > 0 && (
            <View style={styles.documentsSection}>
              <Title style={styles.sectionTitle}>Documentos Requeridos</Title>
              <List.Section>
                {scholarship.documentos.map((document, index) => (
                  <List.Item
                    key={`document-${index}`}
                    title={document}
                    left={props => <List.Icon {...props} icon="file-document" color={COLORS.secondary} />}
                    titleStyle={styles.documentText}
                    style={styles.listItem}
                    titleNumberOfLines={0}
                    accessibilityLabel={`Documento ${index + 1}: ${document}`}
                  />
                ))}
              </List.Section>
            </View>
          )}

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
            style={[styles.applyButton, (isExpired || isNotStarted) && styles.expiredButton]}
            labelStyle={styles.buttonLabel}
            disabled={isExpired || isNotStarted || !scholarship.url}
            accessibilityLabel={isExpired ? "Convocatoria cerrada" : isNotStarted ? "Convocatoria no iniciada" : "Aplicar a la beca"}
          >
            {isExpired ? "Convocatoria cerrada" : 
             isNotStarted ? "Convocatoria no iniciada" : 
             scholarship.url ? "Aplicar ahora" : "Sin URL de aplicación"}
          </Button>
        </Card.Actions>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 8,
  },
  card: {
    margin: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    overflow: 'hidden',
  },
  image: {
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingHorizontal: 8,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.primary,
    marginRight: 8,
    textTransform: 'capitalize',
  },
  infoSection: {
    marginTop: 16,
    backgroundColor: '#f8f8f8',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: "600",
    flex: 2,
    textAlign: "right",
  },
  amount: {
    color: COLORS.secondary,
    fontWeight: "bold",
    fontSize: 16,
  },
  expired: {
    color: COLORS.error,
    fontWeight: 'bold',
  },
  urgent: {
    color: '#E65100',
    fontWeight: 'bold',
  },
  active: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  notStarted: {
    color: '#FF9800',
    fontWeight: 'bold',
  },
  descriptionSection: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    color: COLORS.primary,
    marginBottom: 12,
    fontWeight: 'bold',
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
    paddingBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: COLORS.text,
    textAlign: 'justify',
  },
  requirementsSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  requirementText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    flexWrap: 'wrap',
    flex: 1,
  },
  documentsSection: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  documentText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    flexWrap: 'wrap',
    flex: 1,
  },
  noRequirements: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 10,
    fontStyle: 'italic',
  },
  contactSection: {
    marginTop: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  listItem: {
    paddingVertical: 8,
    marginVertical: 4,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    paddingLeft: 12,
    minHeight: 48,
  },
  actions: {
    padding: 16,
    justifyContent: "center",
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  applyButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  expiredButton: {
    backgroundColor: COLORS.error,
  },
  buttonLabel: {
    color: COLORS.surface,
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Estilos para la pantalla de carga
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIcon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  spinner: {
    marginVertical: 20,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  // Estilos para la pantalla de error
  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorIcon: {
    marginBottom: 20,
    opacity: 0.8,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
});

export default ScholarshipDetailScreen;