import React from 'react';
import { ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import SchoolCalendar from '../components/SchoolCalendar';
import EventNotifications from '../components/EventNotifications';
import { COLORS } from '../theme/theme';

// Define explícitamente el tipo del componente como React.FC (Functional Component)
const CalendarScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top'] as Edge[]}>
      <ScrollView style={styles.scrollView}>
        <SchoolCalendar />
      </ScrollView>
    </SafeAreaView>
  );
};

export default CalendarScreen;

// Tipos para estilos (opcional, para mejor autocompletado)
interface Styles {
  container: ViewStyle;
  scrollView: ViewStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
});
