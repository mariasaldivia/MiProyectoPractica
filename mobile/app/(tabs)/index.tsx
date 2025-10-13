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

// Habilitar el plugin para dayjs
dayjs.extend(customParseFormat);

const COLORS = {
  black: '#000000',
  darkestGray: '#1A1A1A',
  darkGray: '#333333',
  orange: '#FF6600', 
  lightOrange: '#FF9900',
  red: '#CC0000',
  white: '#FFFFFF',
  lightGray: '#AAAAAA',
  softGreen: '#3CB371', // Para estado "Activo"
  // Color para la tarjeta de alerta que no es crítica
  infoYellow: '#FFC300', 
  alertBackground: '#5D4037', // Fondo sutil para la alerta (café oscuro)
};

// --- LÓGICA DE LA ALERTA ---
const TARGET_TIME = '10:00'; // Hora límite para enviar el formulario

// Asegúrate de que SÓLO recibe UN argumento (el cargo)
const getFormAlert = (cargoRecibido: string | null): { message: string, color: string, isAlert: boolean } => {
  // 🚨 CAMBIO DE NOMBRE: Usaremos 'cargoRecibido' para evitar cualquier conflicto de nombres
  console.log("Cargo Recibido DENTRO de la función:", cargoRecibido); // <--- INSPECCIONA ESTE LOG

  // Si el valor es null o undefined, sal de inmediato (manejado por isLoading)
  if (!cargoRecibido) {
      return { 
          message: 'Cargando datos de sesión...', 
          color: COLORS.lightGray, 
          isAlert: false 
      };
  }

  // 2. Condición: Verificar si el usuario es "Conductor" (AHORA MÁS ROBUSTO)
  // Convertimos a minúsculas y limpiamos espacios para asegurar la coincidencia.
  const cargoNormalized = cargoRecibido.trim().toLowerCase();
  const isDriver = cargoNormalized.includes("conductor"); 7
  console.log(cargoNormalized);
  console.log(isDriver);
  
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
  // Creamos un objeto dayjs para las 10:00 AM de hoy
  const targetTimeToday = dayjs(TARGET_TIME, 'HH:mm');
  

  // 3. Evaluar la diferencia de tiempo
  if (now.isBefore(targetTimeToday)) {
    // Si la hora actual es antes de las 10:00 AM

    const diffMinutes = targetTimeToday.diff(now, 'minute');

    if (diffMinutes <= 30) {
      // Faltan 30 minutos o menos (Alerta temprana)
      const diffDisplay = diffMinutes > 0 
          ? `Faltan ${diffMinutes} min` 
          : '¡Es la hora límite!';
      
      return { 
        message: `${diffDisplay} para las ${TARGET_TIME} AM. Recuerda completar y enviar tu formulario.`,
        color: COLORS.infoYellow,
        isAlert: true // Es una alerta que debe mostrarse
      };

    } else {
      // Falta mucho tiempo
      return { 
        message: `El formulario de hoy (${TARGET_TIME} AM) aún no es urgente.`,
        color: COLORS.lightGray,
        isAlert: false
      };
    }

  } else {
    // Si la hora actual es después de las 10:00 AM (Alerta tardía)
    return {
      message: `¡AVISO! Ya pasó la hora límite (${TARGET_TIME} AM). Por favor, envía tu formulario *inmediatamente*.`,
      color: COLORS.red, // Usa rojo para indicar urgencia
      isAlert: true
    };
  }
};
// --- FIN LÓGICA DE LA ALERTA ---

export default function Index() {
  
  const router = useRouter();
  const { userName, userRut, userCargo } = useAuth(); // Obtener datos del usuario
   // 🚨 1. IMPLEMENTACIÓN DEL CONSOLE.LOG AQUÍ 🚨
  console.log("--- DEBUG SESIÓN HOME ---");
  console.log("userName:", userName);
  console.log("userCargo RAW:", userCargo); // Este es el valor clave a inspeccionar
  console.log("---------------------------");



  // 🚨 Obtener la alerta
  const alertData = getFormAlert(userCargo);
  // Datos simulados para las tarjetas
  const todayDate = new Date().toLocaleDateString('es-CL');
  const activeStatus = 'Activo';

  // Acceso directo al formulario
  const goToFormulario = () => {
    router.push('/(tabs)/form_tripulacion');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* 1. Encabezado Personalizado */}
        <View style={styles.header}>
         
          <Text style={styles.greetingText}>
            Buen día, {userName ? userName.split(' ').slice(0, 2).join(' ') : 'Usuario'} 👋
          </Text>
          <Text style={styles.greetingText}>
            {userCargo ? userCargo : 'Sin cargo'}
          </Text>
          <Text style={styles.dateText}>{todayDate}</Text>
        </View>

        {/* 2. Tarjeta de Estado Rápido */}
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Estado Operacional</Text>
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
          
          {/* Tarjeta 1: Formulario (Acción Principal) */}
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={goToFormulario}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="clipboard-text-outline" size={32} color={COLORS.orange} />
            <Text style={styles.actionText}>Nuevo Registro</Text>
          </TouchableOpacity>

          {/* Tarjeta 2: Historial (Acción Secundaria) */}
          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={() => alert('Próximamente: Historial de Viajes')}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="history" size={32} color={COLORS.lightGray} />
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
                // Aplicar un fondo sutil si es una alerta activa
                alertData.isAlert && { backgroundColor: COLORS.alertBackground }
            ]}
        >
            <Text 
                style={[
                    styles.alertText, 
                    // Aplicar color de texto según el tipo de alerta
                    { color: alertData.color }
                ]}
            >
                <MaterialCommunityIcons 
                    name={alertData.isAlert ? 'alert-circle' : 'check-circle-outline'} 
                    size={16} 
                    color={alertData.color} 
                />
                {'  '}{alertData.message}
            </Text>
        </View>

      </ScrollView>
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
    padding: 20,
    paddingBottom: 80, // Espacio para las pestañas
  },
  
  // 1. Encabezado
  header: {
    marginBottom: 30,
    marginTop: 10,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  dateText: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginTop: 4,
  },
  
  // 2. Tarjeta de Estado
  statusCard: {
    backgroundColor: COLORS.darkestGray,
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    // Sombra Naranja (Efecto 'flotante')
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: COLORS.lightGray,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statusInfo: {
    fontSize: 14,
    color: COLORS.lightGray,
    marginTop: 5,
  },

  // 3. Secciones
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 10,
    marginBottom: 15,
  },

  // 4. Tarjetas de Acción
  cardContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionCard: {
    width: '48%', // Permite 2 tarjetas por fila con espacio entre ellas
    backgroundColor: COLORS.darkestGray,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    // Sombra sutil para la acción secundaria
    shadowColor: COLORS.black, 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  actionText: {
    color: COLORS.white,
    marginTop: 10,
    fontWeight: '600',
    fontSize: 15,
    textAlign: 'center',
  },
  
  // 5. Alertas

    // 🚨 NUEVOS ESTILOS PARA LA CAJA DE ALERTA
  alertBox: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.darkGray,
  },
  alertText: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '600',
  },
  noAlertsText: {
    color: COLORS.lightGray,
    textAlign: 'center',
    padding: 20,
    backgroundColor: COLORS.darkGray,
    borderRadius: 10,
  },
});
