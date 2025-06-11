import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../theme/theme";
import ProfileHeader from "../components/ProfileHeader";
import UserDetailsModal from "../components/UserDetailsModal";
import ProfileSections from "../components/ProfileSections";

export default ProfileScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState("publicaciones");

  // Mock user data
  const user = {
    firstName: "Juan",
    lastName: "Pérez García",
    email: "juan.perez@example.com",
    studentId: "A01234567",
    birthDate: "15/05/1995"
  };

  const handleDetailsPress = () => {
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const handleSectionChange = (section) => {
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