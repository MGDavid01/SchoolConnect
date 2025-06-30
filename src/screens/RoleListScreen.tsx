// src/screens/RoleListScreen.tsx
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { API_URL } from "../constants/api"; // <- este es tu archivo con la IP dinámica

const RoleListScreen = () => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  fetch(`${API_URL}/roles`)
    .then(res => {
      console.log("Status", res.status);
      return res.text();  // Leer como texto para ver qué es realmente
    })
    .then(text => {
      console.log("Respuesta cruda del servidor:", text);
      const data = JSON.parse(text);  // Intenta parsear después de loggear
      setRoles(data);
      setLoading(false);
    })
    .catch(error => {
      console.error("Error al obtener roles:", error);
      setLoading(false);
    });
}, []);


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#471396" />
      </View>
    );
  }

  return (
    <FlatList
      data={roles}
      keyExtractor={item => item._id}
      renderItem={({ item }) => (
        <View style={styles.item}>
          <Text>{item.nombreRol}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc"
  }
});

export default RoleListScreen;
