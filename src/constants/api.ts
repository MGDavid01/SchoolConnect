import Constants from "expo-constants";

// Cambiar la ip a la ip del dispositivo que ejecutará el backend y proyecto
const localIP = Constants.manifest?.debuggerHost?.split(":")[0] || "192.168.0.19";

// Se puede ejecutar el backend en export const API_URL = "http://localhost:4000"; para la realización de pruebas
// ya que puede haber fallas con el navegador, pero esto solo servirá dentro del mismo dispositivo, no se podrá ejecutar
// en móvil

export const API_URL = `http://${localIP}:4000`;

// URL para WebSocket (Socket.io)
export const WS_URL = `ws://${localIP}:4000`;
