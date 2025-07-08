import React, { useState, useContext } from "react";
import { ScrollView, StyleSheet, View, Text, ActivityIndicator, Alert, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../theme/theme";
import ProfileHeader from "../components/ProfileHeader";
import UserDetailsModal from "../components/UserDetailsModal";
import ProfileSections from "../components/ProfileSections";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigation } from "@react-navigation/native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../navigation/types";

type ProfileSection = "publicaciones" | "comentarios" | "guardados" | "likes";


const ProfileScreen: React.FC = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Error al cargar la información del usuario</Text>
      </SafeAreaView>
    );
  }

  const { user, logout } = authContext;
  const [modalVisible, setModalVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<ProfileSection>("publicaciones");

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ textAlign: "center", marginTop: 10 }}>Cargando perfil...</Text>
      </SafeAreaView>
    );
  }

  const handleDetailsPress = () => setModalVisible(true);
  const handleModalClose = () => setModalVisible(false);
  const handleSectionChange = (section: ProfileSection) => setActiveSection(section);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollContainer}>
        <View style={styles.headerSection}>
          <ProfileHeader
            user={user}
            onDetailsPress={handleDetailsPress}
            onLogoutPress={logout}
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
        onLogoutPress={logout}
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
  logoutButtonContainer: {
    marginTop: 20,
    marginHorizontal: 20,
  },
  modalOverlay: {
  position: "absolute",
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
},
modalContent: {
  width: "80%",
  padding: 20,
  backgroundColor: "white",
  borderRadius: 10,
  elevation: 10
},
modalTitle: {
  fontSize: 18,
  fontWeight: "bold",
  marginBottom: 10,
  textAlign: "center"
},
modalText: {
  fontSize: 16,
  marginBottom: 20,
  textAlign: "center"
},
modalButtons: {
  flexDirection: "row",
  justifyContent: "space-between"
}

});

export default ProfileScreen;
