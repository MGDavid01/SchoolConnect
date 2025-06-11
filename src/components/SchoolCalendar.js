import React, { useState, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions
} from "react-native"
import { Calendar } from "react-native-calendars"
import { IconButton, Button } from "react-native-paper"
import moment from "moment"
import { COLORS } from "../theme/theme"
import { calendarTheme } from "../theme/theme"
import { markedDates } from "../constants/calendarEvents" // Removido markingType

const { height: SCREEN_HEIGHT } = Dimensions.get("window")

export default SchoolCalendar = () => {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonthIndex = now.getMonth()
  const academicYearStart =
    currentMonthIndex >= 8 ? currentYear : currentYear - 1
  const academicYearEnd = academicYearStart + 1

  const minDate = `${academicYearStart}-09-01`
  const maxDate = `${academicYearEnd}-08-31`

  const getInitialMonth = () => {
    const monthIndex = new Date().getMonth()
    return monthIndex >= 8
      ? `${academicYearStart}-09`
      : moment().format("YYYY-MM")
  }

  const [modalVisible, setModalVisible] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(getInitialMonth())
  const [selectedDate, setSelectedDate] = useState(
    moment().format("YYYY-MM-DD")
  )
  const [calendarKey, setCalendarKey] = useState(0)
  const pulseAnim = useRef(new Animated.Value(1)).current
  const fadeAnim = useRef(new Animated.Value(1)).current
  const [selectedDayInfo, setSelectedDayInfo] = useState({
    title: "Este día será un muy buen día",
    date: moment().format("DD [de] MMMM [del] YYYY"),
    hasEvent: false
  })

  const calendarTitle = `Calendario Escolar ${academicYearStart}-${academicYearEnd}`

  const handleDayPress = day => {
    const dateStr = day.dateString
    setSelectedDate(dateStr)

    const event = markedDates[dateStr]
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

  const handleEventPress = date => {
    setModalVisible(false)
    setSelectedDate(date) // Agregar esta línea

    const event = markedDates[date]
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

  const handleMonthChange = month => {
    const newMonth = month.dateString
    if (newMonth >= minDate && newMonth <= maxDate) {
      setCurrentMonth(newMonth)
    }
  }

  const eventsByMonth = Object.entries(markedDates || {}).reduce(
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
    {}
  )

  // Crear markedDates con selección mejorada
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

  console.log("markedDates:", markedDates)
  console.log("selectedDate:", selectedDate)
  console.log("markedDatesWithSelection:", markedDatesWithSelection)

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{calendarTitle}</Text>
      </View>

      <Animated.View
        style={[
          styles.calendarContainer,
          { transform: [{ scale: pulseAnim }], opacity: fadeAnim }
        ]}
      >
        <Calendar
          key={calendarKey}
          markedDates={markedDatesWithSelection}
          markingType="period" // Definir directamente aquí
          current={currentMonth}
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
          firstDay={1}
          hideExtraDays={false}
          minDate={minDate}
          maxDate={maxDate}
          disableArrowLeft={moment(currentMonth).isSameOrBefore(
            moment(minDate).startOf("month"),
            "month"
          )}
          disableArrowRight={moment(currentMonth).isSameOrAfter(
            moment(maxDate).startOf("month"),
            "month"
          )}
          theme={{
            ...calendarTheme,
            // Asegurar que los colores de período se muestren
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: COLORS.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: COLORS.primary,
            dayTextColor: '#2d4150',
            textDisabledColor: '#d9e1e8',
            dotColor: COLORS.primary,
            selectedDotColor: '#ffffff',
            arrowColor: COLORS.primary,
            monthTextColor: COLORS.primary,
            indicatorColor: COLORS.primary,
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '300',
            textDayFontSize: 16,
            textMonthFontSize: 16,
            textDayHeaderFontSize: 13
          }}
        />
      </Animated.View>

      <View style={styles.footer}>
        <Button
          mode="contained"
          onPress={handleGoToToday}
          icon="calendar-today"
          style={styles.todayButton}
          labelStyle={styles.buttonLabel}
        >
          Hoy
        </Button>
        <Button
          mode="contained"
          onPress={() => setModalVisible(true)}
          icon="calendar-search"
          style={styles.eventsButton}
          labelStyle={styles.buttonLabel}
        >
          Ver Eventos
        </Button>
      </View>

      <View
        style={[
          styles.dayInfoContainer,
          selectedDayInfo.hasEvent && styles.dayInfoWithEvent
        ]}
      >
        <Text style={styles.dayInfoTitle}>{selectedDayInfo.title}</Text>
        <Text style={styles.dayInfoDate}>{selectedDayInfo.date}</Text>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Eventos del Calendario</Text>
              <IconButton
                icon="close"
                size={24}
                onPress={() => setModalVisible(false)}
              />
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.eventsListContent}
            >
              {Object.entries(eventsByMonth).map(([month, events]) => (
                <View key={month} style={styles.monthSection}>
                  <Text style={styles.monthTitle}>{month}</Text>
                  {events.map(event => (
                    <TouchableOpacity
                      key={event.date}
                      style={styles.eventItem}
                      onPress={() => handleEventPress(event.date)}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.eventDot,
                          { backgroundColor: event.color }
                        ]}
                      />
                      <View style={styles.eventInfo}>
                        <Text style={styles.eventName}>{event.name}</Text>
                        <Text style={styles.eventDate}>
                          {moment(event.date).format("DD [de] MMMM, YYYY")}
                        </Text>
                      </View>
                      <IconButton
                        icon="chevron-right"
                        size={20}
                        iconColor={COLORS.textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
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
    justifyContent: "flex-end"
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.8,
    minHeight: SCREEN_HEIGHT * 0.6
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: COLORS.primary },
  eventsListContent: { paddingHorizontal: 16, paddingBottom: 24 },
  monthSection: { marginTop: 16 },
  monthTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: COLORS.primary
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41
  },
  eventDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  eventInfo: { flex: 1 },
  eventName: { fontSize: 16, fontWeight: "500" },
  eventDate: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 }
})