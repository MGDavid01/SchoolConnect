import Constants from "expo-constants";

//Cambiar la ip a la ip del dispositivo que ejecutará el backend y proyecto
const localIP = Constants.manifest?.debuggerHost?.split(":")[0] || "192.168.0.2";

export const API_URL = `http://${localIP}:4000`;
