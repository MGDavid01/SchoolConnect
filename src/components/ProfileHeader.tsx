import React, { useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native"
import { COLORS } from "../theme/theme"
import type { UserType } from "../contexts/AuthContext"

type ProfileHeaderProps = {
  user?: UserType;
  onDetailsPress: () => void;
  onLogoutPress: () => void;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onDetailsPress,
  onLogoutPress
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleOpenModal = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return (
    <>
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>¿Estás seguro que deseas cerrar sesión?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCloseModal}
              >
                <Text style={styles.modalButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => {
                  handleCloseModal();
                  onLogoutPress();
                }}
              >
                <Text style={styles.modalButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.profileHeader}>
        <View style={styles.profileImage} />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>{user?.nombre || ""}</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={onDetailsPress}
            >
              <Text style={styles.detailsButtonText}>Ver detalles</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleOpenModal}
            >
              <Text style={styles.logoutButtonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    marginRight: 20,
  },
  profileInfo: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
  },
  detailsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  detailsButtonText: {
    color: COLORS.surface,
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
  },
  logoutButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    textAlign: 'left',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: COLORS.secondary,
  },
  confirmButton: {
    backgroundColor: COLORS.error,
  },
  modalButtonText: {
    color: COLORS.surface,
    fontSize: 14,
  },
});

export default ProfileHeader;
