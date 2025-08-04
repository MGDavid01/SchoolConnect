import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  message: string;
  onClose: () => void;
  children?: React.ReactNode;
  showContactButton?: boolean;
};

const CustomModal: React.FC<Props> = ({
  visible,
  title,
  message,
  onClose,
  children,
  showContactButton = false,
}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {title && <Text style={styles.title}>{title}</Text>}
          <Text style={styles.message}>{message}</Text>

          {showContactButton && (
            <View style={styles.contactContainer}>
              <Text style={styles.contactText}>
                Puedes contactar a servicios escolares al siguiente correo:
              </Text>
              <View style={styles.emailBox}>
                <Text selectable style={styles.emailText}>
                  servicios@universidad.edu
                </Text>
              </View>
            </View>
          )}

          {children}

          <TouchableOpacity onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#000000aa",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    width: "85%",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  message: {
    fontSize: 16,
    marginBottom: 18,
    textAlign: "center",
    color: "#555",
  },
  contactContainer: {
    marginTop: 10,
    alignItems: "center",
  },
  contactText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
    color: "#444",
  },
  emailBox: {
    backgroundColor: "#f1f1f1",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  emailText: {
    fontSize: 15,
    color: "#007bff",
    fontWeight: "bold",
  },
  button: {
    marginTop: 24,
    backgroundColor: "#7A1625",
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
