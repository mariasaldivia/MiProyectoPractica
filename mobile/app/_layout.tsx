// app/_layout.tsx
import { Stack, useRouter, useSegments } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
// 🚨 Importar el Provider y el Hook
import { AuthProvider, useAuth } from "../app/utils/AuthContext"; 

// --- 1. Componente que contiene la lógica de redirección ---
// ¡Ya está envuelto por AuthProvider, así que useAuth() funciona aquí!
function AuthenticatedStack() { 
    // Usa el hook para obtener el estado global
    const { userRut, isLoading } = useAuth(); 
    const router = useRouter();
    const segments = useSegments();

    useEffect(() => {
        if (isLoading) return;

        // La lógica de redirección se mantiene
        const inAuthGroup = segments[0] === "(tabs)"; 

        if (!userRut && inAuthGroup) {
            router.replace("/login"); // ❌ No hay user, forzar login
        } else if (userRut && !inAuthGroup) {
            router.replace("/(tabs)"); // ✅ Hay user, forzar tabs
        }
    }, [userRut, segments, isLoading]);

    // Retorna el Stack de navegación
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="login" />
            <Stack.Screen name="(tabs)" />
        </Stack>
    );
}

// --- 2. Componente Root que envuelve la app con el Contexto ---
export default function RootLayout() {
    return (
        <AuthProvider>
            {/* Se usa el componente de arriba DENTRO del Provider */}
            <AuthenticatedStack /> 
        </AuthProvider>
    );
}