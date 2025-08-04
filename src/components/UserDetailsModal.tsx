import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated } from "react-native";
import { COLORS } from "../theme/theme";
import { IconButton, Divider } from "react-native-paper";
import ChangePasswordModal from "./ChangePasswordModal";

interface User {
  _id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rol: string;
  grupoID?: string;
  activo: boolean;
  fechaRegistro: Date;
  fechaNacimiento: Date;
}

interface UserDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  user?: User;
  onLogoutPress?: () => void;
}



const UserDetailsModal: React.FC<UserDetailsModalProps> = ({ visible, onClose, user, onLogoutPress }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
        scaleAnim.setValue(0.9);
      });
    }
  }, [visible]);

  return (
    <Modal animationType="none" transparent visible={visible} onRequestClose={onClose}>
      <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.modalContent, { transform: [{ scale: scaleAnim }] }]}>
          {/* Botón cerrar en esquina */}
          <IconButton
            icon="close"
            size={24}
            onPress={onClose}
            style={styles.closeIcon}
            iconColor={COLORS.textSecondary}
          />

          <Text style={styles.modalTitle}>Información del usuario</Text>
          <Divider style={{ marginBottom: 16, opacity: 0.3 }} />

          {[
            { label: "Nombre", value: user?.nombre },
            { label: "Apellido Paterno", value: user?.apellidoPaterno },
            { label: "Apellido Materno", value: user?.apellidoMaterno },
            { label: "Rol", value: user?.rol },
            { label: "Grupo", value: user?.grupoID },
            {
              label: "Fecha de registro",
              value: user?.fechaRegistro ? new Date(user.fechaRegistro).toLocaleDateString() : undefined,
            },
          ].map((item, idx) => (
            <View style={styles.infoRow} key={idx}>
              <Text style={styles.label}>{item.label}:</Text>
              <Text style={styles.value}>{item.value || "N/A"}</Text>
            </View>
          ))}
          <TouchableOpacity
            style={{
              marginTop: 20,
              padding: 12,
              borderRadius: 10,
              backgroundColor: COLORS.primary,
              alignItems: "center",
            }}
            onPress={() => setPasswordModalVisible(true)}
          >
            <Text style={{ color: "white", fontWeight: "600" }}>Cambiar contraseña</Text>
          </TouchableOpacity>

          {onLogoutPress && (
            <TouchableOpacity
              style={{
                marginTop: 12,
                padding: 12,
                borderRadius: 10,
                backgroundColor: COLORS.error,
                alignItems: "center",
              }}
              onPress={onLogoutPress}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Cerrar sesión</Text>
            </TouchableOpacity>
          )}

          {/* Modal de cambio de contraseña */}
          <ChangePasswordModal
            visible={passwordModalVisible}
            onClose={() => setPasswordModalVisible(false)}
            userId={user?._id}
          />
        </Animated.View>
      </Animated.View>
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
    borderRadius: 16,
    padding: 20,
    width: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: "relative",
  },
  closeIcon: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  label: {
    fontWeight: "600",
    color: COLORS.text,
    fontSize: 15,
  },
  value: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
});

export default UserDetailsModal;
