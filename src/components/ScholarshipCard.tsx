import React from "react"
import { StyleSheet, View } from "react-native"
import { Card, Title, Paragraph, Text, Chip } from "react-native-paper"
import { COLORS } from "../theme/theme"

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
  monto?: number;
  institucion?: string;
}

type ScholarshipCardProps = {
  scholarship: Scholarship
  onPress: (scholarship: Scholarship) => void
}

const ScholarshipCard: React.FC<ScholarshipCardProps> = ({
  scholarship,
  onPress
}) => {
  const daysUntilDeadline = () => {
    const deadline = new Date(scholarship.fechaFin)
    const today = new Date()
    const diffTime = deadline.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const deadlineDays = daysUntilDeadline()
  const isUrgent = deadlineDays <= 7 && deadlineDays > 0
  const isExpired = deadlineDays <= 0

  // Utilidad para capitalizar la primera letra
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Card style={styles.card} onPress={() => onPress(scholarship)}>
      <View style={styles.titleSection}>
        <Title style={styles.title}>{scholarship.titulo}</Title>
      </View>
      
      <Card.Content style={styles.content}>
        <View style={styles.chipContainer}>
          <Chip style={[styles.chip, { backgroundColor: COLORS.secondary }]} textStyle={styles.chipText}>
            {capitalize(scholarship.tipo)}
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
            {isExpired ? "Expirada" : isUrgent ? `¡${deadlineDays} días!` : `${deadlineDays} días`}
          </Chip>
        </View>
        
        <Paragraph style={styles.description} numberOfLines={3}>
          {scholarship.descripcion}
        </Paragraph>
      </Card.Content>
      
      <View style={styles.footerSection}>
        {scholarship.tipo === "beca" ? (
          <>
            <Text style={styles.amount}>Monto: {scholarship.monto ? `$${scholarship.monto}` : '-'}</Text>
            <Text style={styles.institution}>Institución: {scholarship.institucion ?? '-'}</Text>
          </>
        ) : (
          <Text style={styles.institution}>Institución: {scholarship.institucion ?? '-'}</Text>
        )}
      </View>
    </Card>
  )
}

export default ScholarshipCard

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 0,
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: COLORS.surface,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
  },
  titleSection: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: COLORS.surface,
  },
  chipContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: 16,
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  chipText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.surface,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'justify',
  },
  footerSection: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flexWrap: "wrap",
  },
  amount: {
    fontSize: 14,
    fontWeight: "bold",
    color: COLORS.surface,
  },
  institution: {
    fontSize: 12,
    color: COLORS.surface,
  }
});
