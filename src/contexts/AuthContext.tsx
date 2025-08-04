//Aqui se guarda el usuario que esta ingresando a la aplicacion por medio del login


import React, { createContext, useEffect, useState, ReactNode, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserType = {
  
  _id: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  rol: "alumno" | "docente" | "personal" | "administrador";
  grupoID?: string;
  activo: boolean;
  fechaRegistro: Date; 
  fechaNacimiento: Date;
  primerInicio: boolean;
} | null;


type AuthContextType = {
  user: UserType;
  isLoading: boolean;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  logout: () => Promise<void>;
  login: (userData: Exclude<UserType, null>) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (userData: Exclude<UserType, null>) => {
    console.log("Guardando en AsyncStorage:", userData);
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error al guardar usuario en AsyncStorage", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      setUser(null);
    } catch (error) {
      console.error("Error al hacer logout", error);
      throw error;
    }
  };

  useEffect(() => {
const loadUser = async () => {
  try {
    const storedUser = await AsyncStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser && parsedUser._id && parsedUser.rol) {
        setUser(parsedUser);
      } else {
        setUser(null); // datos inválidos
      }
    }
  } catch (error) {
    console.error("Error cargando usuario desde AsyncStorage", error);
  } finally {
    setIsLoading(false);
  }
};
    loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, setUser, logout, login }}>
     {isLoading ? null : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};

export type { UserType };