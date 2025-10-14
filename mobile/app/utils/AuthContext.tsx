// utils/AuthContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments  } from 'expo-router';

// Definición del tipo de contexto
interface AuthContextType {
  userRut: string | null;
  userName: string | null; // 🚨 Nuevo campo para el nombre
  userCargo: string | null;
  isLoading: boolean;
  signIn: (rut: string, name: string, cargo:string) => Promise<void>;
  signOut: () => Promise<void>;
}

// 1. Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 2. Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// 3. Proveedor del Contexto
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userRut, setUserRut] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userCargo, setUserCargo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión al inicio
  useEffect(() => {
    const checkSession = async () => {
      const rutGuardado = await AsyncStorage.getItem("rutUsuario");
      const nameGuardado = await AsyncStorage.getItem("userName")
      const cargoGuardado = await AsyncStorage.getItem("userCargo")
      
      setUserRut(rutGuardado);
      setUserName(nameGuardado);
      setUserCargo(cargoGuardado);
      setIsLoading(false);
    };
    checkSession();
  }, []);

  // Función para iniciar sesión (actualiza estado y AsyncStorage)
  const signIn = async (rut: string, name: string, cargo: string) => {
    await AsyncStorage.setItem("rutUsuario", rut);
    await AsyncStorage.setItem("userName",name);
    await AsyncStorage.setItem("userCargo",cargo);

    setUserRut(rut); // ¡Actualiza el estado inmediatamente!
    setUserName(name);
    setUserCargo(cargo);
  };

  // Función para cerrar sesión
  const signOut = async () => {
    //Eliminar datos al cerrar sesión
    await AsyncStorage.removeItem("rutUsuario");
    await AsyncStorage.removeItem("userName")
    await AsyncStorage.removeItem("userCargo")
    
    setUserRut(null);
    setUserName(null);
  };

  return (
    <AuthContext.Provider value={{ userRut,userName, userCargo,  isLoading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}