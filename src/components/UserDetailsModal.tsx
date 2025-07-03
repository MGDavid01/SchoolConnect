import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal } from "react-native";
import { COLORS } from "../theme/theme";

interface User {
  _id: string;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
  fechaRegistro: Date;
}

interface UserDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  user?: User; // puede ser undefined mientras carga
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ visible, onClose, user }) => {
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
            <Text style={styles.modalValue}>{user?.nombre || "N/A"}</Text>
          </View>

          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Correo:</Text>
            <Text style={styles.modalValue}>{user?.correo || "N/A"}</Text>
          </View>

          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Rol:</Text>
            <Text style={styles.modalValue}>{user?.rol || "N/A"}</Text>
          </View>

          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Activo:</Text>
            <Text style={styles.modalValue}>{user?.activo ? "Sí" : "No"}</Text>
          </View>

          <View style={styles.modalRow}>
            <Text style={styles.modalLabel}>Fecha de registro:</Text>
            <Text style={styles.modalValue}>
              {user?.fechaRegistro ? new Date(user.fechaRegistro).toLocaleDateString() : "N/A"}
            </Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
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


export default UserDetailsModal;
