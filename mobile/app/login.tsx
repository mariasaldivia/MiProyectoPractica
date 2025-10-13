import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router'; // Importamos useRouter
import { useAuth } from "../app/utils/AuthContext"; 


// --- BASE DE DATOS DE SIMULACIÓN ---
// S
const USERS_DB = [
    { rut: "10628303-6", clave: "1062", name: "Alex Salgado Aguilar", cargo: "Coordinador de flota" },
    { rut: "11129781-9", clave: "1112", name: "Luis Cardenas Bahamonde", cargo: "Conductor"},
    { rut: "12070161-4", clave: "1207", name: "Jorge Fuentes Masias", cargo: "Conductor" },
    { rut: "13166565-2", clave: "1316", name: "Ermi Cavada Igor", cargo: "Conductor" },
    { rut: "13324036-5", clave: "1332", name: "Daniel Alvaro Delgado", cargo: "Auxiliar de reparto" },
    { rut: "14227723-9", clave: "1422", name: "Pedro Guerrero Barria", cargo: "Auxiliar de reparto" },
    { rut: "15508916-4", clave: "1550", name: "Osvaldo Ojeda", cargo: "Auxiliar de reparto" },
    { rut: "16136678-1", clave: "1613", name: "Cludio Sanhueza Millatureo", cargo: "Auxiliar de reparto" },
    { rut: "16158779-6", clave: "1615", name: "Luis Gonzalez Talma", cargo: "Auxiliar de reparto" },
    { rut: "16893853-5", clave: "1689", name: "Hermi Vargas Garriel", cargo: "Auxiliar de reparto" },
];

//- prueba 

// --- PALETA DE COLORES ---
const COLORS = {
  black: '#000000',
  darkGray: '#333333',
  inputBackground: '#1A1A1A',
  orange: '#FF6600',
  red: '#CC0000',
  white: '#FFFFFF',
  lightGray: '#AAAAAA',
};

// --- COMPONENTE DE PANTALLA DE LOGIN ---
export default function Login() {
  const [rut, setRut] = useState<string>('');
  const [clave, setClave] = useState<string>(''); // Usaremos 'clave' para mantener la consistencia con tu código anterior
 // const [cargo, setCargo] = useState<string>('');
  const [showClave, setShowClave] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null); // Usamos un string para el mensaje de error
  const router = useRouter(); // Inicializamos el router
  const { signIn } = useAuth(); // Usar el hook dentro del componente

  const handleLogin = async () => {
    // 1. Resetear el error visual
    setErrorText(null); 

    if (!rut.trim() || !clave.trim()) {
      const msg = "Ingresa tu RUT y clave.";
      console.log("Falta rut o clave");
      Alert.alert("Error", msg);
      setErrorText(msg);
      return;
    }

    // 🚨 1. BUSCAR USUARIO en el array
    const userFound = USERS_DB.find(
      user => user.rut === rut && user.clave === clave 
    );

    if (userFound) {
            
      // LOGIN EXITOSO
      // 🚨 2. Llama a signIn con el RUT Y EL NOMBRE y cargo
      await signIn(userFound.rut, userFound.name, userFound.cargo); 
      
    //  console.log(`LOGIN EXITOSO para: ${userFound.name}`);
      
      // Redirige al área privada
      router.replace("/(tabs)"); 

    } else {
      // LOGIN FALLIDO
      const msg = "RUT o clave incorrectos.";
      Alert.alert("Error", msg);
      setErrorText(msg); 
    }
 };




  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen 
        options={{ 
          headerShown: false // Oculta la barra de navegación en el login
        }} 
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* LOGO SIMULADO */}
        <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="truck-fast" size={80} color={COLORS.orange} />
            <Text style={styles.logoText}>DIPROCHIL</Text>
        </View>

        {/* CONTENEDOR DE LOGIN (CARD) */}
        <View style={styles.loginCard}>
          
          {/* CAMPO RUT */}
          <Text style={styles.label}>RUT</Text>
          <TextInput
            style={[styles.input, { borderColor: rut.length > 0 ? COLORS.orange : COLORS.darkGray }]}
            onChangeText={setRut}
            value={rut}
            placeholder="11222333-k"
            placeholderTextColor={COLORS.lightGray}
            keyboardType="default" 
            autoCapitalize="none"
          />

          {/* CAMPO CLAVE (Contraseña) */}
          <Text style={styles.label}>Clave</Text>
          <View style={[styles.passwordInputContainer, { borderColor: clave.length > 0 ? COLORS.orange : COLORS.darkGray }]}>
            <TextInput
              style={styles.passwordInput}
              onChangeText={setClave}
              value={clave}
              placeholder="••••"
              placeholderTextColor={COLORS.lightGray}
              secureTextEntry={!showClave}
              autoCapitalize="none"
            />
            <TouchableOpacity 
              onPress={() => setShowClave(!showClave)} 
              style={styles.togglePassword}
            >
              <MaterialCommunityIcons 
                name={showClave ? "eye-off" : "eye"} 
                size={24} 
                color={COLORS.lightGray} 
              />
            </TouchableOpacity>
          </View>

          {/* BOTÓN INGRESAR (Naranja) */}
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>INGRESAR</Text>
          </TouchableOpacity>

          {/* ENLACES SECUNDARIOS */}
          <View style={styles.linkContainer}>
            <TouchableOpacity><Text style={styles.linkText}>¿Olvidaste tu clave?</Text></TouchableOpacity>
            <TouchableOpacity><Text style={styles.linkText}>Crear una cuenta</Text></TouchableOpacity>
          </View>
        </View>
        
        {/* MENSAJE DE ERROR (Rojo) */}
        {errorText && (
            <Text style={styles.errorText}>
                {errorText}
            </Text>
        )}
      </KeyboardAvoidingView>
      
      {/* DISEÑO DE LA RUTA INFERIOR */}
      <View style={styles.routeDesign} />
      
    </SafeAreaView>
  );
}

// --- ESTILOS ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
  },
  loginCard: {
    backgroundColor: COLORS.inputBackground,
    padding: 25,
    borderRadius: 10,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  label: {
    color: COLORS.white,
    fontSize: 16,
    marginBottom: 5,
    marginTop: 15,
    fontWeight: '600',
  },
  input: {
    height: 48,
    backgroundColor: COLORS.darkGray,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: COLORS.white,
    fontSize: 16,
    borderWidth: 1,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.darkGray,
    borderRadius: 8,
    height: 48,
    borderWidth: 1,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    color: COLORS.white,
    fontSize: 16,
  },
  togglePassword: {
    padding: 10,
  },
  loginButton: {
    backgroundColor: COLORS.orange,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 10,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkContainer: {
    alignItems: 'center',
  },
  linkText: {
    color: COLORS.lightGray,
    fontSize: 14,
    marginVertical: 4,
    textDecorationLine: 'underline',
  },
  errorText: {
    color: COLORS.red,
    fontSize: 15,
    textAlign: 'center',
    marginTop: 20,
    fontWeight: 'bold',
  },
  routeDesign: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    borderTopWidth: 8,
    borderTopColor: COLORS.orange,
  }
});