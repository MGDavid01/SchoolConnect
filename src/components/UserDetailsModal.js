import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { COLORS } from "../theme/theme";

export default UserDetailsModal = ({ visible, onClose, user }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Información del usuario</Text>
          
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Nombre:</Text>
            <Text style={styles.modalValue}>{user?.firstName}</Text>
          </View>
          
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Apellidos:</Text>
            <Text style={styles.modalValue}>{user?.lastName}</Text>
          </View>
          
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Matrícula:</Text>
            <Text style={styles.modalValue}>{user?.studentId}</Text>
          </View>
          
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Correo:</Text>
            <Text style={styles.modalValue}>{user?.email}</Text>
          </View>
          
          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Fecha de nacimiento:</Text>
            <Text style={styles.modalValue}>{user?.birthDate}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: "center",
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  modalLabel: {
    fontWeight: "bold",
    color: COLORS.text,
  },
  modalValue: {
    color: COLORS.textSecondary,
  },
  closeButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: COLORS.surface,
    textAlign: "center",
  },
});
