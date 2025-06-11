import React, { useState } from "react"
import { StyleSheet, View, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import {
  Searchbar,
  Portal,
  Modal,
  List,
  Text,
  Button
} from "react-native-paper"
import ScholarshipCard from "../components/ScholarshipCard"
import { COLORS } from "../theme/theme"

const scholarshipTypes = [
  "Académica",
  "Deportiva",
  "Cultural",
  "Socioeconómica",
  "Internacional"
]
const educationLevels = ["TSU", "Ingeniería", "Posgrado"]

export default ScholarshipScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [filterType, setFilterType] = useState(null)
  const [scholarships, setScholarships] = useState([
    {
      id: "1",
      title: "Beca de Excelencia Académica",
      description:
        "Beca completa para estudiantes con promedio superior a 9.5 en el cuatrimestre anterior.",
      type: "Académica",
      deadline: "2024-05-15",
      educationLevel: "TSU",
      amount: "$5,000 MXN mensuales",
      requirements: [
        "Promedio mínimo de 9.5",
        "No tener materias reprobadas",
        "Estar inscrito como alumno regular"
      ],
      institution: "UTT",
      imageUrl:
        "https://utt.edu.mx/wp-content/uploads/2023/05/Biblioteca-scaled.jpg",
      isFavorite: false
    },
    {
      id: "2",
      title: "Beca Deportiva UTT",
      description:
        "Para estudiantes que representan a la universidad en competencias deportivas estatales o nacionales.",
      type: "Deportiva",
      deadline: "2024-04-30",
      educationLevel: "Ingeniería",
      amount: "$3,000 MXN mensuales",
      requirements: [
        "Ser parte de un equipo representativo",
        "Mantener promedio mínimo de 8.0",
        "Asistir a entrenamientos regulares"
      ],
      institution: "UTT",
      imageUrl:
        "https://utt.edu.mx/wp-content/uploads/2023/05/Deportes-scaled.jpg",
      isFavorite: false
    },
    {
      id: "3",
      title: "Beca Cultural",
      description:
        "Apoyo para estudiantes que participan en grupos culturales y artísticos de la universidad.",
      type: "Cultural",
      deadline: "2024-04-20",
      educationLevel: "TSU",
      amount: "$2,500 MXN mensuales",
      requirements: [
        "Participar en grupos culturales",
        "Mantener promedio mínimo de 8.0",
        "Asistir a ensayos y presentaciones"
      ],
      institution: "UTT",
      imageUrl:
        "https://utt.edu.mx/wp-content/uploads/2023/05/Cultura-scaled.jpg",
      isFavorite: false
    }
  ])

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch =
      scholarship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scholarship.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = !selectedType || scholarship.type === selectedType
    const matchesLevel =
      !selectedLevel || scholarship.educationLevel === selectedLevel
    return matchesSearch && matchesType && matchesLevel
  })

  const handleScholarshipPress = scholarship => {
    navigation.navigate("ScholarshipDetail", { scholarship })
  }

  const handleToggleFavorite = id => {
    setScholarships(
      scholarships.map(scholarship =>
        scholarship.id === id
          ? { ...scholarship, isFavorite: !scholarship.isFavorite }
          : scholarship
      )
    )
  }

  const showFilterModal = type => {
    setFilterType(type)
    setFilterModalVisible(true)
  }

  const hideFilterModal = () => {
    setFilterModalVisible(false)
    setFilterType(null)
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Buscar becas..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        <View style={styles.filterButtons}>
          <Button
            mode="contained"
            onPress={() => showFilterModal("type")}
            icon="filter-variant"
            style={styles.filterButton}
            labelStyle={styles.filterLabel}
          >
            {selectedType || "Tipo de beca"}
          </Button>
          <Button
            mode="contained"
            onPress={() => showFilterModal("level")}
            icon="school"
            style={styles.filterButton}
            labelStyle={styles.filterLabel}
          >
            {selectedLevel || "Nivel educativo"}
          </Button>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {filteredScholarships.map(scholarship => (
          <ScholarshipCard
            key={scholarship.id}
            scholarship={scholarship}
            onPress={handleScholarshipPress}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
        {filteredScholarships.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No se encontraron becas que coincidan con los filtros
              seleccionados
            </Text>
          </View>
        )}
      </ScrollView>

      <Portal>
        <Modal
          visible={filterModalVisible}
          onDismiss={hideFilterModal}
          contentContainerStyle={styles.modalContainer}
        >
          <List.Section>
            <List.Subheader>
              {filterType === "type"
                ? "Selecciona el tipo de beca"
                : "Selecciona el nivel educativo"}
            </List.Subheader>
            <List.Item
              title="Todos"
              onPress={() => {
                filterType === "type"
                  ? setSelectedType(null)
                  : setSelectedLevel(null)
                hideFilterModal()
              }}
              left={props => <List.Icon {...props} icon="filter-remove" />}
            />
            {(filterType === "type" ? scholarshipTypes : educationLevels).map(
              item => (
                <List.Item
                  key={item}
                  title={item}
                  onPress={() => {
                    filterType === "type"
                      ? setSelectedType(item)
                      : setSelectedLevel(item)
                    hideFilterModal()
                  }}
                  left={props => (
                    <List.Icon
                      {...props}
                      icon={filterType === "type" ? "school" : "book-education"}
                    />
                  )}
                  right={props =>
                    (filterType === "type" ? selectedType : selectedLevel) ===
                    item ? (
                      <List.Icon {...props} icon="check" />
                    ) : null
                  }
                />
              )
            )}
          </List.Section>
        </Modal>
      </Portal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  header: {
    backgroundColor: COLORS.surface,
    paddingTop: 8,
    paddingBottom: 12,
    elevation: 4
  },
  searchbar: {
    margin: 8,
    marginTop: 4,
    backgroundColor: COLORS.background,
    elevation: 2
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingTop: 4,
    gap: 8
  },
  filterButton: {
    flex: 1,
    backgroundColor: COLORS.primary
  },
  filterLabel: {
    color: COLORS.surface,
    fontSize: 12
  },
  content: {
    paddingVertical: 8
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    marginTop: 40
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: "center"
  },
  modalContainer: {
    backgroundColor: COLORS.surface,
    padding: 20,
    margin: 20,
    borderRadius: 8
  }
})
