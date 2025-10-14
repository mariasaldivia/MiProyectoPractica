import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from "../app/utils/AuthContext"; 


// --- BASE DE DATOS DE SIMULACIÓN (Mantenida) ---
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

const LOGO_IMAGE = require('../assets/images/logo_Diprochil.png')
// --- PALETA DE COLORES OPTIMIZADA (COHERENTE CON LOGO ROJO/NARANJA Y MODO OSCURO) ---
const COLORS = {
  // Fondo principal (Gris muy oscuro con un toque de azul para riqueza)
  mainBackground: '#101014', 
  // Fondo principal del formulario (ligeramente separado del fondo)
  cardBackground: '#1A1A22', 
  // Fondo del Input (gris más oscuro)
  inputBackground: '#121218', 
  // Borde sutil del Input en estado normal
  inputBorder: '#3A4048', 
  // Naranja corporativo (para botón y focus) - COINCIDE CON TU LOGO
  orange: '#FF6600', 
  // Rojo corporativo (para errores y alertas urgentes) - COINCIDE CON TU LOGO
  red: '#DA291C', // Un tono de rojo más claro y corporativo
  // Color para texto normal y labels
  white: '#FFFFFF', 
  // Color para enlaces y placeholders
  lightGray: '#AAAAAA', 
};

// --- COMPONENTE DE PANTALLA DE LOGIN ---
export default function Login() {
  const [rut, setRut] = useState<string>('');
  const [clave, setClave] = useState<string>('');
  const [showClave, setShowClave] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  // Estados de Foco para el efecto "Glow"
  const [isRutFocused, setIsRutFocused] = useState(false);
  const [isClaveFocused, setIsClaveFocused] = useState(false);
  
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    setErrorText(null);

    if (!rut.trim() || !clave.trim()) {
      const msg = "Ingresa tu RUT y clave.";
      Alert.alert("Error", msg);
      setErrorText(msg);
      return;
    }

    const userFound = USERS_DB.find(
      user => user.rut === rut && user.clave === clave
    );

    if (userFound) {
      await signIn(userFound.rut, userFound.name, userFound.cargo);
      router.replace("/(tabs)");
    } else {
      const msg = "RUT o clave incorrectos.";
      Alert.alert("Error", msg);
      setErrorText(msg);
    }
  };

  const getFocusStyle = (isFocused: boolean) => (
    isFocused ? styles.inputFocused : {}
  );

{/** 
function validarRut(rut: string): boolean {
    // 1. Limpieza y Separación
    const rutLimpio = rut.replace(/[^0-9kK]/g, '').toUpperCase();
    if (rutLimpio.length <= 1) return false;

    const dvEsperado = rutLimpio.slice(-1);
    const cuerpo = rutLimpio.slice(0, -1);

    if (isNaN(Number(cuerpo))) return false;

    // 2. Cálculo del Dígito Verificador (Módulo 11)
    let suma = 0;
    let multiplo = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += Number(cuerpo[i]) * multiplo;
        // Reiniciar la secuencia (2, 3, 4, 5, 6, 7)
        multiplo = multiplo < 7 ? multiplo + 1 : 2;
    }

    const resto = suma % 11;
    const dvCalculadoNum = 11 - resto;
    let dvCalculado: string;
    
    // 3. Asignación del DV
    if (dvCalculadoNum === 11) {
        dvCalculado = '0';
    } else if (dvCalculadoNum === 10) {
        dvCalculado = 'K';
    } else {
        dvCalculado = String(dvCalculadoNum);
    }

    // 4. Comparación
    return dvCalculado === dvEsperado;
}

// -----------------------------------------------------------
// 🚨 NECESITAS ESTA FUNCIÓN PARA LA LÓGICA DE GUARDADO 🚨
// -----------------------------------------------------------


function formatearRutConGuion(rutLimpio: string): string {
    // Aseguramos que solo trabajamos con números y K/k
    const limpio = rutLimpio.replace(/[^0-9kK]/g, '').toUpperCase();

    if (limpio.length <= 1) {
        return limpio;
    }

    const dv = limpio.slice(-1);
    const cuerpo = limpio.slice(0, -1);

    return `${cuerpo}-${dv}`; // Retorna en el formato deseado
}

// -----------------------------------------------------------

// --- Lógica del Guardado ---

const rutIngresado = '17.227.147-K'; // Lo que ingresó el usuario

if (validarRut(rutIngresado)) {
    // 1. Limpiamos el RUT completamente (ej: '17227147K')
    const rutLimpioSinGuion = rutIngresado.replace(/[^0-9kK]/g, '').toUpperCase();
    
    // 2. Formateamos al formato deseado (ej: '17227147-K')
    const rutParaGuardar = formatearRutConGuion(rutLimpioSinGuion);
    
    console.log(`✅ RUT Válido. Guardando como: ${rutParaGuardar}`);
    // Aquí iría tu código para guardar en la base de datos o enviar a la API
    // saveToDatabase(rutParaGuardar);
} else {
    console.log(`❌ RUT Inválido.`);
}

*/}

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen
        options={{
          headerShown: false
        }}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* LOGO SIMULADO: Usamos el Rojo del logo en el icono principal */}
        <View style={styles.logoContainer}>
          {/* El camión debe ser NARANJA, la 'D' del logo es ROJA. Usaremos el NARANJA para mantener la coherencia con el botón.
          <MaterialCommunityIcons name="truck-fast" size={80} color={COLORS.orange} />  */}
            {/* Usamos el componente Image para cargar el logo */}
          <Image
            source={LOGO_IMAGE} 
            style={styles.logoImage} // <-- Estilo específico para la imagen (tamaño, etc.)
            resizeMode="contain" // <-- Ajusta el modo de redimensionamiento
          />
          {/* 
          <Text style={styles.logoText}>DIPROCHIL</Text>
           */}
        </View>

        {/* CONTENEDOR DE LOGIN (CARD) */}
        <View style={styles.loginCard}>

          {/* CAMPO RUT */}
          <Text style={styles.label}>RUT</Text>
          <TextInput
            style={[
              styles.input,
              getFocusStyle(isRutFocused), // Aplica el 'glow' si está enfocado
            ]}
            onChangeText={setRut}
            value={rut}
            onFocus={() => setIsRutFocused(true)}
            onBlur={() => setIsRutFocused(false)}
            placeholder="11222333-k"
            placeholderTextColor={COLORS.lightGray}
            keyboardType="default"
            autoCapitalize="none"
          />

          {/* CAMPO CLAVE (Contraseña) */}
          <Text style={styles.label}>Clave</Text>
          <View style={[
            styles.passwordInputContainer,
            getFocusStyle(isClaveFocused), // Aplica el 'glow' si está enfocado
          ]}>
            <TextInput
              style={styles.passwordInput}
              onChangeText={setClave}
              value={clave}
              onFocus={() => setIsClaveFocused(true)}
              onBlur={() => setIsClaveFocused(false)}
              placeholder="••••"
              placeholderTextColor={COLORS.lightGray}
              secureTextEntry={!showClave}
              autoCapitalize="none"
              maxLength={4}
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

          {/* BOTÓN INGRESAR */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              // Deshabilita el botón si no hay RUT o Clave
              !rut.trim() || !clave.trim() ? styles.buttonDisabled : {}
            ]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={!rut.trim() || !clave.trim()}
          >
            <Text style={styles.buttonText}>INGRESAR</Text>
          </TouchableOpacity>

          {/* ENLACES SECUNDARIOS: Más separación del botón */}
          <View style={styles.linkContainer}>
            <TouchableOpacity><Text style={styles.linkText}>¿Olvidaste tu clave?</Text></TouchableOpacity>
            {/* <TouchableOpacity><Text style={styles.linkText}>Crear una cuenta</Text></TouchableOpacity> */}
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

// --- ESTILOS MEJORADOS (Adaptados a la nueva paleta) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.mainBackground, // Usando el nuevo fondo oscuro
  },
  container: {
    flex: 1,
    paddingHorizontal: 30, // Más padding horizontal para centrar mejor
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50, // Más espacio debajo del logo
  },
    logoImage: { // <--- NUEVO ESTILO PARA LA IMAGEN
    width: 250, // Equivalente al size={80} del ícono
    height: 250, 
    marginBottom: 10,
  },
  logoText: {
    color: COLORS.white,
    fontSize: 26, // Ligeramente más grande
    fontWeight: '700', // Un buen grosor, no excesivo
    marginTop: 5,
    letterSpacing: 1, // Pequeño espaciado para un look más moderno
  },
  loginCard: {
    backgroundColor: COLORS.cardBackground, // Nuevo fondo de tarjeta
    padding: 30,
    borderRadius: 12, // Borde ligeramente más redondeado
    
    // Sombra sutil para darle más profundidad
    shadowColor: COLORS.mainBackground,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },
  label: {
    color: COLORS.lightGray, // Color más sutil para las etiquetas
    fontSize: 14,
    marginBottom: 5,
    marginTop: 20, // Más espacio entre campos
    fontWeight: '500',
  },
  input: {
    height: 50, // Ligeramente más alto
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: COLORS.white,
    fontSize: 17,
    borderWidth: 1,
    borderColor: COLORS.inputBorder, // Borde sutil
    
    // Transiciones para suavizar el cambio de foco
    // Nota: React Native no soporta 'transitionProperty' ni 'transitionDuration' nativamente,
    // pero los dejamos como referencia de intención de diseño. El efecto de sombra ya usa el motor nativo.
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    height: 50, // Ligeramente más alto
    borderWidth: 1,
    borderColor: COLORS.inputBorder, // Borde sutil
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 15,
    color: COLORS.white,
    fontSize: 17,
    
  },
  // ESTILO DE FOCO (El "Glow" Naranja)
  inputFocused: {
    borderColor: COLORS.orange, // Borde naranja al enfocar
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 8,
  },
  togglePassword: {
    padding: 10,
  },
  loginButton: {
    backgroundColor: COLORS.orange,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 40, // Más espacio sobre el botón
    marginBottom: 20, // Más espacio debajo del botón
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 12,
  },
  buttonDisabled: {
    backgroundColor: COLORS.inputBorder, // Color oscuro cuando está inactivo
    shadowOpacity: 0.2,
    elevation: 0,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '800', // Más grosor para la acción principal
  },
  linkContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: COLORS.lightGray,
    fontSize: 15,
    marginVertical: 6,
    textDecorationLine: 'none', // Quitamos el subrayado, es más limpio
  },
  errorText: {
    color: COLORS.red, // Usando el ROJO CORPORATIVO para el error
    fontSize: 16,
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
