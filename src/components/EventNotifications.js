import React from "react"
import { View, Text, StyleSheet } from "react-native"
import moment from "moment"
import {
  CALENDAR_EVENTS_2024_2025,
  EVENT_TYPES
} from "../constants/calendarEvents"

export default EventNotifications = () => {
  const upcomingEvents = Object.entries(CALENDAR_EVENTS_2024_2025)
    .filter(([date]) => {
      const eventDate = moment(date)
      const today = moment()
      const daysUntilEvent = eventDate.diff(today, "days")
      return daysUntilEvent >= 0 && daysUntilEvent <= 7 // Eventos en los próximos 7 días
    })
    .map(([date, event]) => {
      const eventType = EVENT_TYPES.find(type => type.color === event.dotColor)
      return {
        date,
        eventName: eventType?.label || "Evento",
        daysUntil: moment(date).diff(moment(), "days")
      }
    })
    .sort((a, b) => a.daysUntil - b.daysUntil)

  if (upcomingEvents.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Próximos Eventos</Text>
      {upcomingEvents.map(event => (
        <View key={event.date} style={styles.eventItem}>
          <Text style={styles.eventName}>{event.eventName}</Text>
          <Text style={styles.eventDate}>
            {event.daysUntil === 0
              ? "Hoy"
              : event.daysUntil === 1
              ? "Mañana"
              : `En ${event.daysUntil} días`}
          </Text>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12
  },
  eventItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0"
  },
  eventName: {
    fontSize: 16,
    flex: 1
  },
  eventDate: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8
  }
})