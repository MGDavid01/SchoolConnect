import React, { useState, useRef, useEffect } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions, ScrollView } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import { Button } from "react-native-paper";
import moment from "moment";
import { COLORS } from "../theme/theme";
import { calendarTheme } from "../theme/theme";
import axios from "axios";
import { API_URL } from "../constants/api";
import { CalendarioEscolar, CalendarioEvento } from "../models/CalendarioEscolar";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// Configuración del idioma español para el calendario
LocaleConfig.locales['es'] = {
  monthNames: [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ],
  monthNamesShort: [
    'Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.',
    'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'
  ],
  dayNames: [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ],
  dayNamesShort: ['Dom.', 'Lun.', 'Mar.', 'Mié.', 'Jue.', 'Vie.', 'Sáb.']
};

LocaleConfig.defaultLocale = 'es';

interface MarkedDates {
  [date: string]: {
    marked?: boolean;
    dotColor?: string;
    selected?: boolean;
    selectedColor?: string;
    selectedTextColor?: string;
    startingDay?: boolean;
    endingDay?: boolean;
    color?: string;
    textColor?: string;
    label?: string;
    description?: string;
  };
}

const CalendarView: React.FC = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const academicYearStart = currentMonthIndex >= 8 ? currentYear : currentYear - 1;
  const academicYearEnd = academicYearStart + 1;

  const minDate = `${academicYearStart}-09-01`;
  const maxDate = `${academicYearEnd}-08-31`;

  const getInitialMonth = (): string => {
    const monthIndex = new Date().getMonth();
    return monthIndex >= 8 ? `${academicYearStart}-09` : moment().format("YYYY-MM");
  };

  const [currentMonth, setCurrentMonth] = useState<string>(getInitialMonth());
  const [selectedDate, setSelectedDate] = useState<string>(moment().format("YYYY-MM-DD"));
  const [calendarKey, setCalendarKey] = useState<number>(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [selectedDayInfo, setSelectedDayInfo] = useState({
    title: "Este será un gran día, Cuervo",
    date: moment().format("DD [de] MMMM [del] YYYY"),
    hasEvent: false,
    description: ""
  });
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});
  const [loading, setLoading] = useState(true);

  // Función para generar rangos de fechas para períodos
  const generateDateRange = (startDate: string, endDate: string, event: CalendarioEvento): MarkedDates => {
    const result: MarkedDates = {};
    const current = new Date(startDate);
    const end = new Date(endDate);
    
    console.log("Generando rango de fechas:", startDate, "a", endDate);
    
    while (current <= end) {
      const iso = current.toISOString().split("T")[0];
      const isStartDay = iso === startDate;
      const isEndDay = iso === endDate;
      
      result[iso] = {
        marked: true,
        dotColor: "#FF6B35", // Naranja para períodos
        color: "#FF6B35",
        textColor: "white",
        startingDay: isStartDay,
        endingDay: isEndDay,
        label: event.nombreEvento,
        description: event.descripcion
      };
      
      console.log("Marcando día:", iso, "como período");
      current.setDate(current.getDate() + 1);
    }
    return result;
  };

  // Función para obtener datos del calendario escolar
  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      console.log("Iniciando fetch de calendario desde:", `${API_URL}/api/calendario`);
      const response = await axios.get(`${API_URL}/api/calendario`);
      const currentCalendar: CalendarioEscolar = response.data;

      console.log("Respuesta completa de la API:", response);
      console.log("Calendario cargado:", currentCalendar);

      if (currentCalendar) {
        const newMarkedDates: MarkedDates = {};
        
        currentCalendar.eventos.forEach(event => {
          console.log("Procesando evento:", event);
          
          if (event.activo) {
            if (event.tipoEvento === "evento" && event.fecha) {
              // Evento de un solo día
              const dateStr = moment(event.fecha).format("YYYY-MM-DD");
              console.log("Evento de un día:", dateStr, event.nombreEvento);
              newMarkedDates[dateStr] = {
                marked: true,
                dotColor: "#4CAF50", // Verde para eventos
                color: "#4CAF50",
                textColor: "white",
                startingDay: true,
                endingDay: true,
                label: event.nombreEvento,
                description: event.descripcion
              };
            } else if (event.tipoEvento === "periodo" && event.fechaInicio && event.fechaFin) {
              // Período de varios días
              console.log("Período:", event.fechaInicio, "a", event.fechaFin, event.nombreEvento);
              const periodDates = generateDateRange(event.fechaInicio, event.fechaFin, event);
              Object.assign(newMarkedDates, periodDates);
            }
          }
        });
        
        console.log("Días marcados:", newMarkedDates);
        console.log("Total de días marcados:", Object.keys(newMarkedDates).length);
        setMarkedDates(newMarkedDates);
      }
    } catch (error) {
      console.error("Error al cargar el calendario escolar:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [academicYearStart]);

  const calendarTitle = `Calendario Escolar ${academicYearStart}-${academicYearEnd}`;

  const handleDayPress = (day: any) => {
    const dateStr = day.dateString;
    setSelectedDate(dateStr);

    const event = markedDates[dateStr];
    const friendlyDate = moment(dateStr).format("DD [de] MMMM [del] YYYY");

    if (event) {
      setSelectedDayInfo({
        title: event.label || "Evento",
        date: friendlyDate,
        hasEvent: true,
        description: event.description || ""
      });
    } else {
      setSelectedDayInfo({
        title: "Este será un gran día, Cuervo",
        date: friendlyDate,
        hasEvent: false,
        description: ""
      });
    }
  };

  const handleGoToToday = () => {
    const today = moment().format("YYYY-MM-DD");
    setSelectedDate(today);
    setCurrentMonth(moment().format("YYYY-MM"));
    setCalendarKey(prev => prev + 1);
  };

  const handleMonthChange = (month: any) => {
    const newMonth = month.dateString;
    if (newMonth >= minDate && newMonth <= maxDate) {
      setCurrentMonth(newMonth);
    }
  };

  const generateTimelineItems = () => {
    if (!markedDates) return [];

    console.log("Generando timeline items con markedDates:", markedDates);

    // Agrupar eventos por tipo y período
    const events: { [key: string]: any } = {};
    const periods: { [key: string]: any } = {};

    // Primero, identificar todos los eventos únicos por etiqueta
    const uniqueEvents = new Set<string>();
    Object.values(markedDates).forEach(event => {
      if (event.label) {
        uniqueEvents.add(event.label);
      }
    });

    console.log("Eventos únicos encontrados:", Array.from(uniqueEvents));

    // Procesar cada evento único
    uniqueEvents.forEach(label => {
      const eventDates = Object.entries(markedDates).filter(([, event]) => event.label === label);
      
      if (eventDates.length === 1) {
        // Es un evento de un solo día
        const [date, event] = eventDates[0];
        events[date] = event;
        console.log("Evento de un día:", label, "en", date);
      } else {
        // Es un período
        const sortedDates = eventDates.sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime());
        const firstEvent = sortedDates[0][1];
        const lastEvent = sortedDates[sortedDates.length - 1][1];
        
        periods[label] = {
          ...firstEvent,
          startDate: sortedDates[0][0],
          endDate: sortedDates[sortedDates.length - 1][0]
        };
        console.log("Período:", label, "desde", sortedDates[0][0], "hasta", sortedDates[sortedDates.length - 1][0]);
      }
    });

    console.log("Eventos encontrados:", events);
    console.log("Períodos encontrados:", periods);

    // Crear array de elementos para la línea de tiempo
    const timelineItems: React.ReactElement[] = [];

    // Agregar eventos de un solo día
    Object.entries(events)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .forEach(([date, event]) => {
        timelineItems.push(
          <View key={`event-${date}`} style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: event.dotColor || "#4CAF50" }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineEventTitle}>{event.label || "Evento sin título"}</Text>
              <Text style={styles.timelineEventDate}>
                {moment(date).format("DD [de] MMMM [del] YYYY")}
              </Text>
              {event.description && (
                <Text style={styles.timelineEventDescription}>{event.description}</Text>
              )}
            </View>
          </View>
        );
      });

    // Agregar períodos
    Object.entries(periods)
      .sort(([, periodA], [, periodB]) => new Date(periodA.startDate).getTime() - new Date(periodB.startDate).getTime())
      .forEach(([label, period]) => {
        const startDate = moment(period.startDate).format("DD [de] MMMM [del] YYYY");
        const endDate = period.endDate ? moment(period.endDate).format("DD [de] MMMM [del] YYYY") : "Fecha por definir";
        
        timelineItems.push(
          <View key={`period-${period.startDate}`} style={styles.timelineItem}>
            <View style={[styles.timelineDot, { backgroundColor: period.dotColor || "#FF6B35" }]} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineEventTitle}>{period.label || "Período sin título"}</Text>
              <Text style={styles.timelineEventDate}>
                Desde {startDate} hasta {endDate}
              </Text>
              {period.description && (
                <Text style={styles.timelineEventDescription}>{period.description}</Text>
              )}
            </View>
          </View>
        );
      });

    console.log("Timeline items generados:", timelineItems.length);
    
    // Ordenar todos los elementos por fecha
    return timelineItems.sort((a, b) => {
      const dateA = a.key?.toString().split('-')[1] || '';
      const dateB = b.key?.toString().split('-')[1] || '';
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  };

  const markedDatesWithSelection = {
    ...markedDates,
    [selectedDate]: {
      ...(markedDates[selectedDate] || {}),
      selected: true,
      selectedColor: markedDates[selectedDate]?.color || COLORS.primary,
      selectedTextColor: markedDates[selectedDate]?.textColor || "#ffffff"
    }
  };

  console.log("Estado actual - loading:", loading, "markedDates:", markedDates);
  
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{calendarTitle}</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando calendario escolar...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={true}>
      <View style={styles.header}>
        <Text style={styles.title}>{calendarTitle}</Text>
      </View>
      <Animated.View style={[styles.calendarContainer, { opacity: fadeAnim }] }>
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
          labelStyle={{ color: '#fff' }}
        >
          Hoy
        </Button>
      </Animated.View>
      
      {/* Información del día seleccionado */}
      <View style={styles.dayInfoContainer}>
        <Text style={styles.dayInfoTitle}>{selectedDayInfo.title}</Text>
        <Text style={styles.dayInfoDate}>{selectedDayInfo.date}</Text>
        {selectedDayInfo.description && (
          <Text style={styles.dayInfoDescription}>{selectedDayInfo.description}</Text>
        )}
      </View>
      
      {/* Línea de tiempo de eventos */}
      <View style={styles.timelineContainer}>
        <Text style={styles.timelineTitle}>
          Línea de Tiempo
        </Text>
        {markedDates && Object.keys(markedDates).length > 0 ? (
          generateTimelineItems()
        ) : (
          <Text style={styles.timelineEmptyText}>
            No hay eventos programados (Total de eventos: {markedDates ? Object.keys(markedDates).length : 0})
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  calendarContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginHorizontal: 8,
    padding: 8,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
  },
  todayButton: {
    marginTop: 10,
    alignSelf: 'center',
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    width: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    borderTopWidth: 5,
    borderTopColor: COLORS.secondary,
  },
  modalEventTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalEventDate: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalEventDescription: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  dayInfoContainer: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 8,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.secondary,
  },
  dayInfoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  dayInfoDate: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  dayInfoDescription: {
    fontSize: 14,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  timelineContainer: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.secondary,
  },
  timelineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    textAlign: 'center',
  },

  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingLeft: 8,
    paddingVertical: 8,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginHorizontal: 4,
    elevation: 1,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
  },
  timelineEventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  timelineEventDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  timelineEventDescription: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 18,
  },
  timelineEmptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default CalendarView; 