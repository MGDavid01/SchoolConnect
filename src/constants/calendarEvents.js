const markingType = "period"

// Colores de ejemplo
const ACADEMIC_COLOR = "#00adf5" // Azul para actividades académicas
const ACADEMIC_TEXT = "white"
const HOLIDAY_COLOR = "#FF0000" // Rojo para días inhábiles
const HOLIDAY_TEXT = "white"

// Rango de fechas helper (no export)
function generateRange(start, end, color, textColor, label) {
  const result = {}
  const current = new Date(start)
  const last = new Date(end)
  while (current <= last) {
    const iso = current.toISOString().split("T")[0]
    result[iso] = {
      color,
      textColor,
      startingDay: iso === start,
      endingDay: iso === end,
      label
    }
    current.setDate(current.getDate() + 1)
  }
  return result
}

// Marcado de períodos académicos
const academicPeriods = {
  ...generateRange(
    "2024-09-23",
    "2024-09-27",
    ACADEMIC_COLOR,
    ACADEMIC_TEXT,
    "Semana de la Contaduría"
  ),
  ...generateRange(
    "2024-10-14",
    "2024-10-18",
    ACADEMIC_COLOR,
    ACADEMIC_TEXT,
    "Semana del Comercio Internacional"
  ),
  ...generateRange(
    "2024-10-21",
    "2024-10-25",
    ACADEMIC_COLOR,
    ACADEMIC_TEXT,
    "Semana de Procesos y Operaciones Industriales"
  ),
  ...generateRange(
    "2024-10-23",
    "2024-10-24",
    ACADEMIC_COLOR,
    ACADEMIC_TEXT,
    "Semana de la Aeronáutica"
  ),
  ...generateRange(
    "2024-11-05",
    "2024-11-08",
    ACADEMIC_COLOR,
    ACADEMIC_TEXT,
    "Semana de Ing. Procesos y Electromecánica"
  ),
  ...generateRange(
    "2024-11-19",
    "2024-11-22",
    ACADEMIC_COLOR,
    ACADEMIC_TEXT,
    "Semana de Negocios"
  ),
  ...generateRange(
    "2024-11-26",
    "2024-11-29",
    ACADEMIC_COLOR,
    ACADEMIC_TEXT,
    "Semana de Gastronomía"
  ),
  ...generateRange(
    "2024-12-03",
    "2024-12-07",
    ACADEMIC_COLOR,
    ACADEMIC_TEXT,
    "Semana de Mantenimiento"
  ),
  ...generateRange(
    "2025-04-10",
    "2025-04-11",
    ACADEMIC_COLOR,
    ACADEMIC_TEXT,
    "Semana de Mantenimiento (Abril)"
  ),
  ...generateRange(
    "2025-07-14",
    "2025-07-18",
    ACADEMIC_COLOR,
    ACADEMIC_TEXT,
    "Semana del TSU Procesos y Mantenimiento"
  ),
  ...generateRange(
    "2025-07-15",
    "2025-07-18",
    ACADEMIC_COLOR,
    ACADEMIC_TEXT,
    "Feria del Empleo UTT"
  )
}

// Días inhábiles (festivos)
const holidays = {
  "2024-09-16": {
    color: HOLIDAY_COLOR,
    textColor: HOLIDAY_TEXT,
    startingDay: true,
    endingDay: true,
    label: "Día de la Independencia de México"
  },
  "2024-10-01": {
    color: HOLIDAY_COLOR,
    textColor: HOLIDAY_TEXT,
    startingDay: true,
    endingDay: true,
    label: "Transmisión del Poder Ejecutivo Federal"
  },
  "2024-10-12": {
    color: HOLIDAY_COLOR,
    textColor: HOLIDAY_TEXT,
    startingDay: true,
    endingDay: true,
    label: "Descubrimiento de América"
  },
  "2024-11-01": {
    color: HOLIDAY_COLOR,
    textColor: HOLIDAY_TEXT,
    startingDay: true,
    endingDay: true,
    label: "Conmemoración tradicional"
  },
  "2024-11-18": {
    color: HOLIDAY_COLOR,
    textColor: HOLIDAY_TEXT,
    startingDay: true,
    endingDay: true,
    label: "Revolución Mexicana"
  },
  "2024-12-05": {
    color: HOLIDAY_COLOR,
    textColor: HOLIDAY_TEXT,
    startingDay: true,
    endingDay: true,
    label: "Estatutos Jurídicos de los Servidores Públicos"
  },
  "2024-12-25": {
    color: HOLIDAY_COLOR,
    textColor: HOLIDAY_TEXT,
    startingDay: true,
    endingDay: true,
    label: "Navidad"
  },
  "2025-01-01": {
    color: HOLIDAY_COLOR,
    textColor: HOLIDAY_TEXT,
    startingDay: true,
    endingDay: true,
    label: "Año Nuevo"
  },
  "2025-02-05": {
    color: HOLIDAY_COLOR,
    textColor: HOLIDAY_TEXT,
    startingDay: true,
    endingDay: true,
    label: "Día de la Constitución Mexicana"
  },
  "2025-03-17": {
    color: HOLIDAY_COLOR,
    textColor: HOLIDAY_TEXT,
    startingDay: true,
    endingDay: true,
    label: "Natalicio de Benito Juárez"
  },
  "2025-05-01": {
    color: HOLIDAY_COLOR,
    textColor: HOLIDAY_TEXT,
    startingDay: true,
    endingDay: true,
    label: "Día del Trabajo"
  },
  "2025-05-16": {
    color: HOLIDAY_COLOR,
    textColor: HOLIDAY_TEXT,
    startingDay: true,
    endingDay: true,
    label: "Día de la Maestra y el Maestro"
  },
  "2025-07-01": {
    color: HOLIDAY_COLOR,
    textColor: HOLIDAY_TEXT,
    startingDay: true,
    endingDay: true,
    label: "Aniversario del SINEDT"
  }
}

// Export final markedDates combinando todo
export const markedDates = {
  ...academicPeriods,
  ...holidays
};
