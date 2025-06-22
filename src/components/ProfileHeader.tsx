import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { COLORS } from "../theme/theme"

// 1. Definir el tipo de `user`
type User = {
  firstName?: string
  lastName?: string
}

// 2. Definir el tipo de las props
type ProfileHeaderProps = {
  user?: User
  onDetailsPress: () => void
}

// 3. Declarar el componente tipado
const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onDetailsPress }) => {
  return (
    <View style={styles.profileHeader}>
      <View style={styles.profileImage} />
      <View style={styles.profileInfo}>
        <Text style={styles.userName}>
          {`${user?.firstName || ""} ${user?.lastName || ""}`}
        </Text>
        <TouchableOpacity style={styles.detailsButton} onPress={onDetailsPress}>
          <Text style={styles.detailsButtonText}>Ver detalles</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ProfileHeader

// 4. Estilos (sin cambios)
const styles = StyleSheet.create({
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
  },
  detailsButtonText: {
    color: COLORS.surface,
    fontSize: 14,
  },
})
