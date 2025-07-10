import Constants from "expo-constants";

//Cambiar la ip a la ip del dispositivo que ejecutará el backend y proyecto
const localIP = Constants.manifest?.debuggerHost?.split(":")[0] || "172.18.7.4";

//Se puede ejecutar el backend en export const API_URL = "http://localhost:4000"; para la reaizacion de pruebas
//ya que puede haber fallas con el navegador, pero esto solo sirvira dentro del mismo dispositivo, no se podra ejecutar
//en movil

export const API_URL = `http://${localIP}:4000`;


