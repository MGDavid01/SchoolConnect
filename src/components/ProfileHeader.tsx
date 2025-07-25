import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, Easing } from "react-native";
import { COLORS } from "../theme/theme";
import type { UserType } from "../contexts/AuthContext";
import { Avatar, IconButton } from "react-native-paper";

type ProfileHeaderProps = {
  user?: UserType;
  onDetailsPress: () => void;
  onLogoutPress: () => void;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onDetailsPress,
  onLogoutPress,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));

  const handleOpenModal = () => {
    setModalVisible(true);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
    ]).start();
  };

  const handleCloseModal = () => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setModalVisible(false);
      scaleAnim.setValue(0.9);
    });
  };

  const avatarLetter = user?.nombre?.charAt(0).toUpperCase() || "?";

  return (
    <>
      <Modal animationType="none" transparent={true} visible={modalVisible} onRequestClose={handleCloseModal}>
        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.modalText}>¿Estás seguro que deseas cerrar sesión?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={handleCloseModal}>
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  handleCloseModal();
                  onLogoutPress();
                }}
              >
                <Text style={styles.modalButtonText}>Salir</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>

      <View style={styles.profileHeader}>
        {/* Avatar */}
        <Avatar.Text
          size={70}
          label={avatarLetter}
          style={{ backgroundColor: COLORS.primary }}
          color="white"
        />

        {/* Info del usuario */}
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user?.nombre || "Usuario"}</Text>

          <View style={styles.actionsRow}>
            {/* Botón Detalles */}
            <IconButton
              icon="account-circle"
              iconColor={COLORS.primary}
              size={26}
              style={styles.actionIcon}
              onPress={onDetailsPress}
            />
            {/* Botón Cerrar Sesión */}
            <IconButton
              icon="logout"
              iconColor={COLORS.error}
              size={26}
              style={styles.actionIcon}
              onPress={handleOpenModal}
            />
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionIcon: {
    backgroundColor: COLORS.background,
    borderRadius: 30,
    marginHorizontal: 4,
  },
  // Modal
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    padding: 24,
    borderRadius: 16,
    width: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 6,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: COLORS.secondary,
  },
  confirmButton: {
    backgroundColor: COLORS.error,
  },
  modalButtonText: {
    color: "white",
    fontWeight: "600",
  },
});

export default ProfileHeader;
