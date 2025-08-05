import Constants from "expo-constants";

<<<<<<< Updated upstream
//Cambiar la ip a la ip del dispositivo que ejecutará el backend y proyecto
=======
// Cambiar la ip a la ip del dispositivo que ejecutará el backend y proyecto
const localIP = Constants.manifest?.debuggerHost?.split(":")[0] || "192.168.0.19";
>>>>>>> Stashed changes

const localIP = Constants.manifest?.debuggerHost?.split(":")[0] || "192.168.0.19";

//Se puede ejecutar el backend en export const API_URL = "http://localhost:4000"; para la reaizacion de pruebas
//ya que puede haber fallas con el navegador, pero esto solo sirvira dentro del mismo dispositivo, no se podra ejecutar
//en movil

export const API_URL = `http://${localIP}:4000`;
