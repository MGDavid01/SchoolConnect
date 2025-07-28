import React, { useState } from 'react';
import { ScrollView, StyleSheet, ViewStyle, View, TouchableOpacity, Text, TextStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import HorarioView from '../components/HorarioView';
import CalendarView from '../components/CalendarView';
import { COLORS } from '../theme/theme';

const TABS = [
  { key: 'calendario', label: 'Calendario' },
  { key: 'horario', label: 'Horario' },
];

const CalendarScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calendario' | 'horario'>('horario');

  return (
    <SafeAreaView style={styles.container} edges={['top'] as Edge[]}>
      <View style={styles.tabsContainer}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === tab.key && styles.tabButtonActive]}
            onPress={() => setActiveTab(tab.key as 'calendario' | 'horario')}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView style={styles.scrollView}>
        {activeTab === 'horario' ? <HorarioView /> : <CalendarView />}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CalendarScreen;

interface Styles {
  container: ViewStyle;
  scrollView: ViewStyle;
  tabsContainer: ViewStyle;
  tabButton: ViewStyle;
  tabButtonActive: ViewStyle;
  tabLabel: TextStyle;
  tabLabelActive: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary, // Fondo primario
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
    marginBottom: 2,
    elevation: 3,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    backgroundColor: 'transparent', // transparente para ver el fondo
  },
  tabButtonActive: {
    borderBottomColor: COLORS.secondary,
    backgroundColor: COLORS.background, // Tab activo con fondo claro
    elevation: 2,
  },
  tabLabel: {
    color: COLORS.surface, // Texto claro sobre fondo primario
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: COLORS.primary, // Texto del tab activo
  },
});
