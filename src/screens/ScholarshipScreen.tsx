import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Searchbar,
  Portal,
  Modal,
  List,
  Text,
  Button
} from "react-native-paper";
import ScholarshipCard from "../components/ScholarshipCard";
import { COLORS } from "../theme/theme";
import { StackNavigationProp } from "@react-navigation/stack"; // Ajusta la ruta según tu estructura
import { ScholarshipStackParamList } from "../navigation/types";
import { RootStackParamList } from "../navigation/types"; // Asegúrate de tener definido tu tipo de navegación
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from 'axios';
import { API_URL } from '../constants/api';
// Definición de tipos
type ScholarshipType = "Académica" | "Deportiva" | "Cultural" | "Socioeconómica" | "Internacional";
type EducationLevel = "TSU" | "Ingeniería" | "Posgrado";

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
}

type ScholarshipScreenProps = NativeStackScreenProps<
  ScholarshipStackParamList,
  "ScholarshipList"
>;


const scholarshipTypes: ScholarshipType[] = [
  "Académica",
  "Deportiva",
  "Cultural",
  "Socioeconómica",
  "Internacional"
];



const educationLevels: EducationLevel[] = ["TSU", "Ingeniería", "Posgrado"];

const ScholarshipScreen: React.FC<ScholarshipScreenProps> = ({ navigation }) => {

  console.log("ScholarshipScreen loaded");

  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const [selectedType, setSelectedType] = useState<ScholarshipType | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<EducationLevel | null>(null);
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<"type" | "level" | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchScholarships = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/becas`);
        setScholarships(res.data);
      } catch (err) {
        setScholarships([]);
      } finally {
        setLoading(false);
      }
    };
    fetchScholarships();
  }, []);

  const filteredScholarships = scholarships.filter(scholarship => {
    const matchesSearch =
      scholarship.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scholarship.descripcion.toLowerCase().includes(searchQuery.toLowerCase());
    // Puedes agregar más filtros si lo deseas
    return matchesSearch;
  });

  const handleScholarshipPress = (scholarship: Scholarship): void => {
    navigation.navigate("ScholarshipDetail", { id: scholarship._id });
  };

  const showFilterModal = (type: "type" | "level"): void => {
    setFilterType(type);
    setFilterModalVisible(true);
  };

  const hideFilterModal = (): void => {
    setFilterModalVisible(false);
    setFilterType(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.titleContainer}>
        <Text style={styles.screenTitle}>Becas</Text>
        <View style={styles.titleAccent} />
      </View>
      <View style={styles.searchContainer}>
        <View style={styles.searchbarWrapper}>
          <Searchbar
            placeholder="Buscar becas..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchbar}
            accessibilityLabel="Buscar becas"
          />
        </View>
        <View style={styles.filterButtons}>
          <Button
            mode="contained"
            onPress={() => showFilterModal("type")}
            icon="filter-variant"
            style={styles.filterButton}
            labelStyle={styles.filterLabel}
            accessibilityLabel="Filtrar por tipo de beca"
          >
            {selectedType || "Tipo de beca"}
          </Button>
          <Button
            mode="contained"
            onPress={() => showFilterModal("level")}
            icon="school"
            style={styles.filterButton}
            labelStyle={styles.filterLabel}
            accessibilityLabel="Filtrar por nivel educativo"
          >
            {selectedLevel || "Nivel educativo"}
          </Button>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Cargando becas...</Text>
          </View>
        ) : filteredScholarships.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No se encontraron becas que coincidan con los filtros seleccionados
            </Text>
          </View>
        ) : (
          filteredScholarships.map(scholarship => (
            <ScholarshipCard
              key={scholarship._id}
              scholarship={scholarship}
              onPress={() => handleScholarshipPress(scholarship)}
            />
          ))
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
                  : setSelectedLevel(null);
                hideFilterModal();
              }}
              left={props => <List.Icon {...props} icon="filter-remove" />}
              accessibilityLabel="Quitar filtro"
            />
            {(filterType === "type" ? scholarshipTypes : educationLevels).map(
              item => (
                <List.Item
                  key={item}
                  title={item}
                  onPress={() => {
                    filterType === "type"
                      ? setSelectedType(item as ScholarshipType)
                      : setSelectedLevel(item as EducationLevel);
                    hideFilterModal();
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
                  accessibilityLabel={`Seleccionar ${item}`}
                />
              )
            )}
          </List.Section>
        </Modal>
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  titleContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    marginBottom: 0,
    paddingBottom: 0,
    elevation: 2,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.surface,
    backgroundColor: COLORS.primary,
    textAlign: 'center',
    paddingVertical: 5,
    width: '100%',
  },
  titleAccent: {
    width: '40%',
    height: 3,
    backgroundColor: COLORS.secondary,
    marginTop: -2,
    marginBottom: 6,
    borderRadius: 2,
  },
  searchContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary,
    gap: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  searchbarWrapper: {
    marginBottom: 8,
  },
  searchbar: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    fontSize: 16,
    justifyContent: 'center',
    textAlignVertical: 'center',
    elevation: 2,
  },
  filterButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    marginHorizontal: 4,
    paddingHorizontal: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.secondary,
    elevation: 2,
  },
  filterLabel: {
    color: COLORS.surface,
    fontSize: 13,
    fontWeight: 'bold',
    paddingHorizontal: 2,
  },
  content: {
    paddingVertical: 8,
    paddingHorizontal: 15,
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
});

export default ScholarshipScreen;