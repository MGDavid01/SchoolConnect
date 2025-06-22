import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { COLORS } from "../theme/theme"

type SectionKey = "publicaciones" | "guardados"

type ProfileSectionsProps = {
  activeSection: SectionKey
  onSectionChange: (section: SectionKey) => void
}

const ProfileSections: React.FC<ProfileSectionsProps> = ({
  activeSection,
  onSectionChange
}) => {
  const sections: { key: SectionKey; label: string }[] = [
    { key: "publicaciones", label: "Publicaciones" },
    { key: "guardados", label: "Guardados" }
  ]

  return (
    <View style={styles.sectionsContainer}>
      <View style={styles.sectionTabs}>
        {sections.map((section) => (
          <TouchableOpacity
            key={section.key}
            style={[
              styles.sectionTab,
              activeSection === section.key && styles.activeSectionTab
            ]}
            onPress={() => onSectionChange(section.key)}
          >
            <Text
              style={[
                styles.sectionTabText,
                activeSection === section.key && styles.activeSectionTabText
              ]}
            >
              {section.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionContent}>
        {activeSection === "publicaciones" ? (
          <Text style={styles.emptyText}>No hay publicaciones aún</Text>
        ) : (
          <Text style={styles.emptyText}>No hay reacciones aún</Text>
        )}
      </View>
    </View>
  )
}

export default ProfileSections

const styles = StyleSheet.create({
  sectionsContainer: {
    backgroundColor: COLORS.surface,
    paddingTop: 0,
  },
  sectionTabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
    marginBottom: 0,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.surface,
  },
  sectionTab: {
    paddingBottom: 10,
    marginRight: 20,
  },
  activeSectionTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  sectionTabText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  activeSectionTabText: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
  sectionContent: {
    minHeight: 100,
    padding: 20,
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
})
