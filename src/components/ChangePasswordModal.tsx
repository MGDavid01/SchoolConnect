import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { COLORS } from "../theme/theme";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import axios from "axios";
import { API_URL } from "../constants/api";
import { IconButton } from "react-native-paper";

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  userId?: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
  userId,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const handleChangePassword = async () => {
    setMessage(null);
    setError(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Por favor completa todos los campos");
      setError(true);
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Las contraseñas nuevas no coinciden");
      setError(true);
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/users/change-password`, {
        userId,
        currentPassword,
        newPassword,
      });

      setMessage("Contraseña cambiada correctamente");
      setError(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => onClose(), 1500); // Cierra tras 1.5s
    } catch (error) {
      console.error(error);
      setMessage("Error al cambiar la contraseña");
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* Botón cerrar */}
                 <IconButton
            icon="close"
            size={24}
            onPress={onClose}
            style={styles.closeIcon}
            iconColor={COLORS.textSecondary}
          />

        <Text style={styles.title}>Cambiar contraseña</Text>

        {/* Campos de contraseña */}
        <PasswordField
          placeholder="Contraseña actual"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secure={!showCurrent}
          onToggleSecure={() => setShowCurrent(!showCurrent)}
        />

        <PasswordField
          placeholder="Nueva contraseña"
          value={newPassword}
          onChangeText={setNewPassword}
          secure={!showNew}
          onToggleSecure={() => setShowNew(!showNew)}
        />

        <PasswordField
          placeholder="Confirmar nueva contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secure={!showConfirm}
          onToggleSecure={() => setShowConfirm(!showConfirm)}
        />

        {/* Mensaje de error o éxito */}
        {message && (
          <Text style={[styles.message, error ? styles.error : styles.success]}>
            {message}
          </Text>
        )}

        {/* Botón o spinner */}
        {loading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 10 }} />
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
            <Text style={styles.buttonText}>Actualizar contraseña</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Componente auxiliar para campos de contraseña con icono de ojo
const PasswordField = ({
  placeholder,
  value,
  onChangeText,
  secure,
  onToggleSecure,
}: {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secure: boolean;
  onToggleSecure: () => void;
}) => (
  <View style={styles.inputWrapper}>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      secureTextEntry={secure}
      value={value}
      onChangeText={onChangeText}
    />
    <TouchableOpacity style={styles.eyeIcon} onPress={onToggleSecure}>
      <Icon
        name={secure ? "eye" : "eye-off"}
        size={22}
        color={COLORS.textSecondary}
      />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    padding: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 20,
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    color: COLORS.text,
  },
  eyeIcon: {
    paddingHorizontal: 4,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },
  message: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },
  error: {
    color: COLORS.error,
  },
  success: {
    color: COLORS.primary,
  },
    closeIcon: {
    position: "absolute",
    top: 6,
    right: 6,
    zIndex: 10,
  },
});

export default ChangePasswordModal;
