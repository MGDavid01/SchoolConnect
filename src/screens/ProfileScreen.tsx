import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../theme/theme";
import ProfileHeader from "../components/ProfileHeader";
import UserDetailsModal from "../components/UserDetailsModal";
import ProfileSections from "../components/ProfileSections";

type ProfileSection = "publicaciones" | "comentarios" | "guardados" | "likes"; // Ajusta según tus secciones reales

interface User {
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  birthDate: string;
}

const ProfileScreen: React.FC = () => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<ProfileSection>("publicaciones");

  // Mock user data
  const user: User = {
    firstName: "Juan",
    lastName: "Pérez García",
    email: "juan.perez@example.com",
    studentId: "A01234567",
    birthDate: "15/05/1995"
  };

  const handleDetailsPress = (): void => {
    setModalVisible(true);
  };

  const handleModalClose = (): void => {
    setModalVisible(false);
  };

  const handleSectionChange = (section: ProfileSection): void => {
    setActiveSection(section);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headerSection}>
          <ProfileHeader 
            user={user}
            onDetailsPress={handleDetailsPress}
          />
        </View>

        <ProfileSections
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
      </ScrollView>

      <UserDetailsModal
        visible={modalVisible}
        onClose={handleModalClose}
        user={user}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: COLORS.surface,
    padding: 20,
    marginBottom: 0,
  },
});

export default ProfileScreen;