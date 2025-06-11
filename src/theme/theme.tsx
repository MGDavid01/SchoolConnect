import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const COLORS = {
  primary: '#7A1625', // Vino/Guinda
  secondary: '#B78E4A', // Oro/Dorado oscuro
  background: '#F5F5F5', // Gris claro
  surface: '#FFFFFF', // Blanco
  text: '#000000', // Negro
  textSecondary: '#4A4A4A', // Gris oscuro
  error: '#D32F2F' // Rojo para errores
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.background,
    surface: COLORS.surface,
    text: COLORS.text,
    onSurface: COLORS.text,
    surfaceVariant: COLORS.background,
    secondaryContainer: COLORS.secondary,
    onSecondaryContainer: COLORS.surface,
    error: COLORS.error,
  },
}; 

// 2. Tema específico para react-native-calendars
export const calendarTheme = {
  todayTextColor: '#2d4150',
  selectedDayBackgroundColor: COLORS.primary,
  selectedDayTextColor: '#ffffff',
  textDayFontSize: 16,
  textMonthFontSize: 18,
  textDayHeaderFontSize: 14,
  monthTextColor: COLORS.primary,
  textMonthFontWeight: 'bold',
  arrowColor: COLORS.primary,
  textDisabledColor: '#d9d9d9',
  dayTextColor: COLORS.text,
  textDayFontWeight: '300',
  textDayHeaderFontWeight: '500',
  'stylesheet.calendar.header': {
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 10,
      alignItems: 'center',
      marginBottom: 10,
    },
    monthText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: COLORS.primary,
    },
  },
  'stylesheet.day.basic': {
    base: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
  },
};