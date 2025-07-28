import React, { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  GestureResponderEvent
} from "react-native"
import { Calendar, DateData } from "react-native-calendars"
import { IconButton, Button } from "react-native-paper"
import moment from "moment"
import { COLORS } from "../theme/theme"
import { calendarTheme } from "../theme/theme"
import { markedDates } from "../constants/calendarEvents"
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { API_URL } from "../constants/api";

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

type EventInfo = {
  title: string
  date: string
  hasEvent: boolean
}

type CalendarEvent = {
  label?: string
  color?: string
  textColor?: string
}

type EventsByMonth = {
  [month: string]: {
    date: string
    name: string
    color: string
  }[]
}

type Month = {
  year: number;
  month: number;
  timestamp: number;
  dateString: string;
}

// Tipos para el horario
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

interface SchoolCalendarProps {
  activeTab?: 'calendario' | 'horario';
}

// CalendarView: solo la parte de calendario escolar (tab calendario)
export const CalendarView: React.FC = () => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthIndex = now.getMonth()
  const academicYearStart = currentMonthIndex >= 8 ? currentYear : currentYear - 1
  const academicYearEnd = academicYearStart + 1

  const minDate = `${academicYearStart}-09-01`
  const maxDate = `${academicYearEnd}-08-31`

  const getInitialMonth = (): string => {
    const monthIndex = new Date().getMonth()
    return monthIndex >= 8 ? `${academicYearStart}-09` : moment().format("YYYY-MM")
  }

  const [modalVisible, setModalVisible] = useState<boolean>(false)
  const [currentMonth, setCurrentMonth] = useState<string>(getInitialMonth())
  const [selectedDate, setSelectedDate] = useState<string>(moment().format("YYYY-MM-DD"))
  const [calendarKey, setCalendarKey] = useState<number>(0)
  const pulseAnim = useRef(new Animated.Value(1)).current
  const fadeAnim = useRef(new Animated.Value(1)).current
  const [selectedDayInfo, setSelectedDayInfo] = useState<EventInfo>({
    title: "Este día será un muy buen día",
    date: moment().format("DD [de] MMMM [del] YYYY"),
    hasEvent: false
  })

  const { user } = useAuth();
  const [horario, setHorario] = useState<HorarioDia[]>([]);
  const [loadingHorario, setLoadingHorario] = useState(false);

  useEffect(() => {
    const fetchHorario = async () => {
      if (!user || user.rol !== "alumno" || !user.grupoID) return;
      setLoadingHorario(true);
      try {
        const res = await axios.get(`${API_URL}/api/horario/${user.grupoID}`);
        setHorario(res.data);
        // Log temporal para depuración
        console.log("Horario recibido:", res.data);
        if (Array.isArray(res.data)) {
          res.data.forEach((h: any) => {
            console.log("diaSemana:", h.diaSemana, "clases:", h.clases?.length);
          });
        }
      } catch (err) {
        setHorario([]);
      } finally {
        setLoadingHorario(false);
      }
    };
    fetchHorario();
  }, [user]);

  const calendarTitle = `Calendario Escolar ${academicYearStart}-${academicYearEnd}`

  const handleDayPress = (day: DateData) => {
    const dateStr = day.dateString
    setSelectedDate(dateStr)

    const event = markedDates[dateStr] as CalendarEvent | undefined
    const friendlyDate = moment(dateStr).format("DD [de] MMMM [del] YYYY")

    if (event) {
      setSelectedDayInfo({
        title: event.label || "Evento",
        date: friendlyDate,
        hasEvent: true
      })
    } else {
      setSelectedDayInfo({
        title: "Este día será un muy buen día",
        date: friendlyDate,
        hasEvent: false
      })
    }
  }

  const handleGoToToday = () => {
    const today = moment().format("YYYY-MM-DD")
    setSelectedDate(today)
    setCurrentMonth(moment().format("YYYY-MM"))
    setCalendarKey(prev => prev + 1)
  }

  const startPulseAnimation = () => {
    pulseAnim.setValue(1)
    fadeAnim.setValue(0.8)

    Animated.parallel([
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 150,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true
        })
      ]),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      })
    ]).start()
  }

  const handleEventPress = (date: string) => {
    setModalVisible(false)
    setSelectedDate(date)

    const event = markedDates[date] as CalendarEvent | undefined
    const friendlyDate = moment(date).format("DD [de] MMMM [del] YYYY")

    if (event) {
      setSelectedDayInfo({
        title: event.label || "Evento",
        date: friendlyDate,
        hasEvent: true
      })
    } else {
      setSelectedDayInfo({
        title: "Este día será un muy buen día",
        date: friendlyDate,
        hasEvent: false
      })
    }

    setCurrentMonth(moment(date).format("YYYY-MM"))
    setCalendarKey(prev => prev + 1)
    setTimeout(startPulseAnimation, 50)
  }

  const handleMonthChange = (month: Month) => {
    const newMonth = month.dateString
    if (newMonth >= minDate && newMonth <= maxDate) {
      setCurrentMonth(newMonth)
    }
  }

  const eventsByMonth: EventsByMonth = Object.entries(markedDates || {}).reduce(
    (acc, [date, event]) => {
      const month = moment(date).format("MMMM YYYY")
      if (!acc[month]) acc[month] = []
      if (event) {
        acc[month].push({
          date,
          name: event.label || "Evento",
          color: event.color || "#7A1625"
        })
      }
      return acc
    },
    {} as EventsByMonth
  )

  const safeMarkedDates = markedDates || {}
  const markedDatesWithSelection = {
    ...safeMarkedDates,
    [selectedDate]: {
      ...(safeMarkedDates[selectedDate] || {}),
      selected: true,
      selectedColor: safeMarkedDates[selectedDate]?.color || COLORS.primary,
      selectedTextColor: safeMarkedDates[selectedDate]?.textColor || "#ffffff"
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{calendarTitle}</Text>
      </View>
      <Animated.View
        style={[
          styles.calendarContainer,
          { opacity: fadeAnim },
        ]}
      >
        <Calendar
          key={calendarKey}
          current={currentMonth}
          minDate={minDate}
          maxDate={maxDate}
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
          markedDates={markedDatesWithSelection}
          theme={calendarTheme}
          hideExtraDays={true}
          firstDay={1}
        />
        <Button
          icon="calendar-today"
          mode="outlined"
          onPress={handleGoToToday}
          style={styles.todayButton}
          labelStyle={{ color: COLORS.primary }}
        >
          Hoy
        </Button>
      </Animated.View>
      {/* Modal de evento del día */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
                    <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalContentBox}>
            <Text style={styles.modalEventTitle}>{selectedDayInfo.title}</Text>
            <Text style={styles.modalEventDate}>{selectedDayInfo.date}</Text>
            {selectedDayInfo.hasEvent && (
              <Button
                mode="contained"
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                Cerrar
              </Button>
            )}
                      </View>
                    </TouchableOpacity>
      </Modal>
    </View>
  );
}

// HorarioView: solo la parte de horario y resumen (tab horario)
export const HorarioView: React.FC = () => {
  const { user } = useAuth();
  const [horario, setHorario] = useState<HorarioDia[]>([]);
  const [loadingHorario, setLoadingHorario] = useState(false);

  useEffect(() => {
    const fetchHorario = async () => {
      if (!user || user.rol !== "alumno" || !user.grupoID) return;
      setLoadingHorario(true);
      try {
        const res = await axios.get(`${API_URL}/api/horario/${user.grupoID}`);
        setHorario(res.data);
        // Log temporal para depuración
        console.log("Horario recibido:", res.data);
        if (Array.isArray(res.data)) {
          res.data.forEach((h: any) => {
            console.log("diaSemana:", h.diaSemana, "clases:", h.clases?.length);
          });
        }
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
              // Calcular resumen por materia
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
                      <Text style={styles.resumenDocente}>Docente(s): {Array.from(m.docentes).join(", ")}</Text>
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
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: "bold", textAlign: "center" },
  calendarContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 4,
    marginBottom: 16
  },
  footer: { flexDirection: "row", justifyContent: "space-between", gap: 16 },
  todayButton: { flex: 1, backgroundColor: COLORS.secondary },
  eventsButton: { flex: 1, backgroundColor: COLORS.primary },
  buttonLabel: { fontSize: 14, fontWeight: "bold" },
  dayInfoContainer: {
    marginTop: 20,
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary
  },
  dayInfoWithEvent: {
    backgroundColor: `${COLORS.primary}10`,
    borderLeftColor: COLORS.primary
  },
  dayInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 4
  },
  dayInfoDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: "italic"
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center", // Changed to center for fade effect
    alignItems: "center"
  },
  modalContentBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    width: "80%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  modalEventTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: "center"
  },
  modalEventDate: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 15,
    textAlign: "center"
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: "100%"
  },
  horarioContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.secondary
  },
  horarioTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: COLORS.primary
  },
  horarioLoading: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center"
  },
  horarioEmpty: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center"
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
  horarioClases: {
    flexDirection: "column"
  },
  horarioClase: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  horarioSinClase: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center"
  }
})
