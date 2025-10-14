import { Text, View, StyleSheet,ScrollView,TouchableOpacity } from 'react-native';
import { Link } from 'expo-router'; 
import React from 'react';
// 🚨 Importamos dayjs para manejo de tiempo
import dayjs from 'dayjs';
// 🚨 Importamos customParseFormat para analizar formatos de hora
import customParseFormat from 'dayjs/plugin/customParseFormat'; 

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../utils/AuthContext'; // Importar el hook de autenticación

import MaterialIcons from '@expo/vector-icons/MaterialIcons';

// Habilitar el plugin para dayjs
dayjs.extend(customParseFormat);

// --- PALETA DE COLORES OPTIMIZADA (COHERENTE CON EL LOGO) ---
const COLORS = {
  // Fondo principal (Gris muy oscuro con un toque de azul para riqueza)
  mainBackground: '#101014', 
  // Fondo principal del formulario/tarjetas
  cardBackground: '#1A1A22', 
  // Borde sutil y textos secundarios
  inputBorder: '#3A4048', 
  // Naranja corporativo (para botón y focus)
  orange: '#FF6600', 
  // Rojo corporativo (para errores y alertas urgentes)
  red: '#DA291C', // Rojo del logo
  // Color para texto normal y títulos
  white: '#FFFFFF', 
  // Color para enlaces y placeholders/textos sutiles
  lightGray: '#AAAAAA', 

  // Colores de estado/alerta
  softGreen: '#3CB371', // Estado "Activo"
  infoYellow: '#FFC300', // Alerta temprana (Amarillo informativo)
  // Fondo sutil para la alerta (Gris más oscuro que el cardBackground)
  alertBackground: '#282834', 
};

// --- LÓGICA DE LA ALERTA (Mantenida) ---
const TARGET_TIME = '10:00'; // Hora límite para enviar el formulario

// Asegúrate de que SÓLO recibe UN argumento (el cargo)
const getFormAlert = (cargoRecibido: string | null): { message: string, color: string, isAlert: boolean } => {
  if (!cargoRecibido) {
      return { 
          message: 'Cargando datos de sesión...', 
          color: COLORS.lightGray, 
          isAlert: false 
      };
  }

  
  const cargoNormalized = cargoRecibido.trim().toLowerCase();
  const isDriver = cargoNormalized.includes("conductor"); 
  
  // 3. Si NO es conductor, retorna el mensaje de bienvenida.
  if (!isDriver) {
    return { 
      message: '¡Bienvenido! Esta alerta solo aplica a conductores.',
      color: COLORS.lightGray,
      isAlert: false
    };
  }
  // 2. Definir los tiempos
  const now = dayjs();
  const targetTimeToday = dayjs(TARGET_TIME, 'HH:mm');
  

  // 3. Evaluar la diferencia de tiempo
  if (now.isBefore(targetTimeToday)) {

    const diffMinutes = targetTimeToday.diff(now, 'minute');

    if (diffMinutes <= 30) {
      // Faltan 30 minutos o menos (Alerta temprana)
      const diffDisplay = diffMinutes > 0 
          ? `Faltan ${diffMinutes} min` 
          : '¡Es la hora límite!';
      
      return { 
        message: `${diffDisplay} para las ${TARGET_TIME} AM. 
        Recuerda completar y enviar tu formulario.`,
        color: COLORS.infoYellow,
        isAlert: true
      };

    } else {
      // Falta mucho tiempo
      return { 
        message: `El formulario de hoy (${TARGET_TIME} AM) aún no es urgente.`,
        color: COLORS.softGreen, // Usamos SoftGreen para indicar que todo está bien
        isAlert: false  
      };
    }

  } else {
    // Si la hora actual es después de las 10:00 AM (Alerta tardía)
    return {
      message: `¡AVISO! Ya pasó la hora límite (${TARGET_TIME} AM). 
      Por favor, envía tu formulario INMEDIATAMENTENTE.`,
      color: COLORS.red, // Usa rojo corporativo para indicar urgencia
      isAlert: true
    };
  }
};
// --- FIN LÓGICA DE LA ALERTA ---

export default function Index() {
  const router = useRouter();
  const { userName, userRut, userCargo } = useAuth();
  // --- LÓGICA PARA CONTROL DE ACCESO ---
  const isDriver = userCargo ? userCargo.toLowerCase().includes("conductor") : false;
  const isCoordinador = userCargo ? userCargo.toLowerCase().includes("coordinador de flota"):false;
  // Obtener la alerta
  const alertData = getFormAlert(userCargo);
  
  const { signOut } = useAuth(); 
  
  const logout = async () => {
    await signOut(); 
    router.replace("/login");
  };
  

  // Datos
  const todayDate = new Date().toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const activeStatus = 'Operando'; // Cambiado a Operando para más formalidad

  // Acceso directo al formulario
  const goToFormulario = () => {
    router.push('/(tabs)/form_tripulacion');
  };
  // Acceso directo a las respuestas del formulario
  const goToPanel = () => {
    router.push('/(tabs)/panel_flota');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Usamos ScrollView para asegurar que todo el contenido sea visible en pantallas pequeñas */}
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* 1. Encabezado Personalizado */}
        <View style={styles.header}>
          <Text style={styles.dateText}>{todayDate}</Text>
          <Text style={styles.greetingText}>
            Hola, {userName ? userName.split(' ').slice(0, 2).join(' ') : 'Usuario'}
          </Text>
          <Text style={styles.cargoText}>
            {userCargo ? userCargo : 'Sin Cargo'}
          </Text>
        </View>

        {/* 2. Tarjeta de Estado Rápido */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Estado Actual</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.dot, { backgroundColor: COLORS.softGreen }]} />
            <Text style={[styles.statusText, { color: COLORS.softGreen }]}>
              {activeStatus}
            </Text>
          </View>
          <Text style={styles.statusInfo}>RUT: {userRut}</Text>
        </View>

        {/* 3. Título de Accesos Rápidos */}
        <Text style={styles.sectionTitle}>Accesos Rápidos</Text>

        {/* 4. Tarjetas de Acción (Botones Grandes) */}
        <View style={styles.cardContainer}>
          
          {/* Tarjeta 1: Formulario (Acción Principal) - Con énfasis */}
       {isDriver && (
          <TouchableOpacity 
            style={[styles.actionCard, styles.primaryActionCard]} // Aplicar el estilo de énfasis
            onPress={goToFormulario}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="clipboard-text-outline" size={36} color={COLORS.orange} />
            <Text style={[styles.actionText, styles.primaryActionText]}>Nuevo Registro</Text>
          </TouchableOpacity>
             )}
        {isCoordinador && (
          <TouchableOpacity 
            style={[styles.actionCard, styles.primaryActionCard]} // Aplicar el estilo de énfasis
            onPress={goToPanel}
            activeOpacity={0.8}
          >
            <MaterialIcons name="question-answer" size={36} color={COLORS.orange}  />
          
            <Text style={[styles.actionText, styles.primaryActionText]}>Respuestas del formulario</Text>
          </TouchableOpacity>
          )}

             
          {/* Tarjeta 2: Historial (Acción Secundaria) */}
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => alert('Próximamente: Historial de Viajes')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="history" size={36} color={COLORS.lightGray} />
            <Text style={styles.actionText}>Ver Historial</Text>
          </TouchableOpacity>
        </View>

        {/* 5. Alertas DINAMICAS */}
        <Text style={styles.sectionTitle}>
            ALERTAS ({alertData.isAlert ? '1' : '0'})
        </Text>
        
        <View 
            style={[
                styles.alertBox,
                { 
                  borderColor: alertData.color, // Borde dinámico para el énfasis
                  backgroundColor: alertData.isAlert ? COLORS.alertBackground : COLORS.cardBackground // Fondo más oscuro si es alerta
                }
            ]}
        >
            <Text 
                style={[
                    styles.alertText, 
                    { color: alertData.color }
                ]}
            >
                <MaterialCommunityIcons 
                    name={alertData.isAlert ? 'alert-circle' : 'check-circle-outline'} 
                    size={22} 
                    color={alertData.color} 
                />
                {'  '}{alertData.message}
            </Text>
        </View>


          <View>
              {/* BOTÓN: CERRAR SESIÓN (Rojo, color secundario/destructivo) */}
              <TouchableOpacity style={styles.secondaryButton} onPress={logout} activeOpacity={0.8}>
                <Text style={styles.buttonText}>Cerrar Sesión</Text>
              </TouchableOpacity>
            </View>
     
                 
           

      </ScrollView>
    </SafeAreaView>
  );
}

// --- ESTILOS MEJORADOS (Adaptados a la nueva paleta y jerarquía) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.mainBackground,
  },
  container: {
    padding: 40,
  },
  
  // 1. Encabezado
  header: {
    marginBottom: 35,
    marginTop: 10,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '700', // Más grosor para el nombre
    color: COLORS.white,
    marginTop: 5,
    marginBottom: 5,
  },
  cargoText: {
    fontSize: 20,
    color: COLORS.orange, // Cargo en naranja para destacar la función
    fontWeight: '600',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 18,
    color: COLORS.lightGray,
    marginBottom: 4,
    textTransform: 'capitalize', // Para que el día de la semana se vea bien
  },
  
  // 2. Tarjeta de Estado
  statusCard: {
    backgroundColor: COLORS.cardBackground,
    padding: 25,
    borderRadius: 12,
    marginBottom: 30,
    // Sombra sutil, sin glow excesivo
    shadowColor: COLORS.mainBackground, 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  statusLabel: {
    fontSize: 18,
    color: COLORS.lightGray,
    fontWeight: '500',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  statusInfo: {
    fontSize: 18,
    color: COLORS.lightGray,
    marginTop: 5,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.inputBorder,
  },

  // 3. Secciones
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 25,
    marginBottom: 15,
  },

  // 4. Tarjetas de Acción
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    width: '48%', 
    backgroundColor: COLORS.cardBackground,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 130, // Ligeramente más alta
    
    shadowColor: COLORS.mainBackground, 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  // Estilo para destacar la acción principal (Nuevo Registro)
  primaryActionCard: {
    // Glow Naranja
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 1,
    borderColor: COLORS.orange,
  },
  actionText: {
    color: COLORS.white,
    marginTop: 10,
    fontWeight: '500',
    fontSize: 16,
    textAlign: 'center',
  },
  primaryActionText: {
    fontWeight: '700',
    color: COLORS.white,
  },
  
  // 5. Alertas
  alertBox: {
    padding: 18,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 2, // Borde más grueso para el énfasis
    
    // Sombra sutil en la caja de alerta
    shadowColor: COLORS.mainBackground, 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  },
  alertText: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 26, // Mejor legibilidad
  },
    secondaryButton: {
    marginTop: 26,
    backgroundColor: COLORS.red, 
    padding: 16, 
    borderRadius: 8, 
    alignItems: "center",
    shadowColor: COLORS.red,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 10,
  },
  buttonText: { 
    color: COLORS.white, 
    fontWeight: "700", 
    fontSize: 20
  },
});