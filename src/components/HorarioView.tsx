import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import { API_URL } from "../constants/api";
import { COLORS } from "../theme/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Clase {
  horaInicio: string;
  horaFin: string;
  materiaID: string;
  docenteID: string;
  nombre?: string;
  horasSemana?: number;
}

interface HorarioDia {
  diaSemana: string;
  clases: Clase[];
}

const diasSemana = [
  "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"
];

const HorarioView: React.FC = () => {
  const { user } = useAuth();
  const [horario, setHorario] = useState<HorarioDia[]>([]);
  const [loadingHorario, setLoadingHorario] = useState(false);

  useEffect(() => {
    const fetchHorario = async () => {
      if (!user || user.rol !== "alumno" || !user.grupoID) return;
      setLoadingHorario(true);
      const storageKey = `horario_${user.grupoID}`;
      try {
        // 1. Intenta cargar de AsyncStorage
        const stored = await AsyncStorage.getItem(storageKey);
        if (stored) {
          setHorario(JSON.parse(stored));
          setLoadingHorario(false);
        }
        // 2. Consulta el backend y actualiza AsyncStorage
        const res = await axios.get(`${API_URL}/api/horario/${user.grupoID}`);
        setHorario(res.data);
        await AsyncStorage.setItem(storageKey, JSON.stringify(res.data));
      } catch (err) {
        setHorario([]);
      } finally {
        setLoadingHorario(false);
      }
    };
    fetchHorario();
  }, [user]);

  return (
    <View style={styles.horarioContainer}>
      <Text style={styles.horarioTitle}>Horario de clases</Text>
      {loadingHorario ? (
        <Text style={styles.horarioLoading}>Cargando horario...</Text>
      ) : horario.length === 0 ? (
        <Text style={styles.horarioEmpty}>No hay horario registrado</Text>
      ) : (
        <>
          {diasSemana.map(dia => {
            const diaData = horario.find(h => h.diaSemana.toLowerCase() === dia);
            return (
              <View key={dia} style={styles.horarioDiaRow}>
                <Text style={styles.horarioDia}>{dia.charAt(0).toUpperCase() + dia.slice(1)}</Text>
                <View style={styles.tablaHeader}>
                  <Text style={styles.tablaHeaderColHora}>Hora</Text>
                  <Text style={styles.tablaHeaderColMateria}>Materia</Text>
                </View>
                {diaData && diaData.clases.length > 0 ? (
                  diaData.clases.map((clase, idx) => (
                    <View key={idx} style={styles.tablaRow}>
                      <Text style={styles.tablaColHora}>{clase.horaInicio} - {clase.horaFin}</Text>
                      <Text style={styles.tablaColMateria}>{clase.nombre || clase.materiaID}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.horarioSinClase}>Sin clases</Text>
                )}
              </View>
            );
          })}
          {/* Resumen de horas y docentes por materia */}
          <View style={styles.resumenContainer}>
            <Text style={styles.resumenTitle}>Resumen de materias</Text>
            {(() => {
              const materiaResumen: Record<string, { nombre: string, horas: number, docentes: Set<string> }> = {};
              horario.forEach(h => {
                h.clases.forEach(c => {
                  if (!c.materiaID) return;
                  const key = c.materiaID;
                  if (!materiaResumen[key]) {
                    materiaResumen[key] = { nombre: c.nombre || c.materiaID, horas: 0, docentes: new Set() };
                  }
                  if (typeof c.horasSemana === 'number') {
                    materiaResumen[key].horas = c.horasSemana;
                  }
                  if (c.docenteID) {
                    materiaResumen[key].docentes.add(c.docenteID);
                  }
                });
              });
              const resumenArr = Object.values(materiaResumen);
              return resumenArr.length === 0 ? (
                <Text style={styles.resumenEmpty}>No hay materias</Text>
              ) : (
                resumenArr.map((m, idx) => (
                  <View key={idx} style={styles.resumenRow}>
                    <View style={{flex: 1}}>
                      <Text style={styles.resumenMateria}>{m.nombre}</Text>
                      <Text style={styles.resumenDocente}>Correo: {Array.from(m.docentes).join(", ")}</Text>
                    </View>
                    <Text style={styles.resumenHoras}>{m.horas} h/semana</Text>
                  </View>
                ))
              );
            })()}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  horarioContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: COLORS.background,
  },
  horarioTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: COLORS.primary,
  },
  horarioLoading: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  horarioEmpty: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  horarioDiaRow: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingTop: 8,
    paddingVertical: 8,
    elevation: 1,
  },
  horarioDia: {
    fontSize: 17,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 6,
    marginLeft: 2,
  },
  tablaHeader: {
    flexDirection: "row",
    backgroundColor: COLORS.secondary,
    borderRadius: 6,
    paddingVertical: 4,
    marginBottom: 2,
    marginHorizontal: 2,
  },
  tablaHeaderColHora: {
    flex: 1.2,
    color: COLORS.surface,
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
  },
  tablaHeaderColMateria: {
    flex: 2.2,
    color: COLORS.surface,
    fontWeight: "bold",
    fontSize: 13,
    textAlign: "center",
  },
  tablaRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    paddingVertical: 3,
    marginHorizontal: 2,
  },
  tablaColHora: {
    flex: 1.2,
    color: COLORS.text,
    fontSize: 13,
    textAlign: "center",
  },
  tablaColMateria: {
    flex: 2.2,
    color: COLORS.primary,
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  horarioSinClase: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  resumenContainer: {
    marginTop: 18,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    elevation: 1,
  },
  resumenTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: COLORS.secondary,
    marginBottom: 8,
  },
  resumenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.surface,
  },
  resumenMateria: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "bold",
  },
  resumenHoras: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "bold",
  },
  resumenDocente: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 2,
  },
  resumenEmpty: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: "center",
  },
});

export default HorarioView; 