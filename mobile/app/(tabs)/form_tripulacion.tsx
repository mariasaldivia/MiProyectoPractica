// app/(tabs)/formulario.tsx
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Modal, // 🚨 Importamos Modal para la ventana emergente
  Animated, // 🚨 Importamos Animated para transiciones suaves
} from "react-native";
import dayjs from "dayjs"; // npm install dayjs
import AsyncStorage from "@react-native-async-storage/async-storage"; // npm install @react-native-async-storage/async-storage
import { useRouter } from "expo-router";
import { useAuth } from "../utils/AuthContext"; 
import { MaterialCommunityIcons } from '@expo/vector-icons';

// --- PALETA DE COLORES OPTIMIZADA (COHERENTE CON LOGO ROJO/NARANJA) ---
const COLORS = {
  mainBackground: '#101014', 
  // Fondo principal del formulario/tarjetas
  cardBackground: '#1A1A22',  
  inputBackground: '#121218', 
  inputBorder: '#3A4048', 
  orange: '#FF6600', 
  red: '#DA291C', 
  white: '#FFFFFF', 
  lightGray: '#AAAAAA', 
  // Colores para estados de alerta
  success: '#3CB371', // Verde suave para éxito
  error: '#DA291C', // Rojo para error
  modalBackground: 'rgba(0, 0, 0, 0.7)', // Fondo semi-transparente del modal
  softGreen: '#3CB371',
};
// --- FUNCIÓN DE ESTILO DE FOCUS ---
const getFocusStyle = (isFocused: boolean) => ({
    borderColor: isFocused ? COLORS.orange : COLORS.inputBorder,
    // Sombra sutil para el efecto de focus
    shadowColor: isFocused ? COLORS.orange : 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: isFocused ? 0.5 : 0,
    shadowRadius: isFocused ? 5 : 0,
    elevation: isFocused ? 2 : 0,
});
// Datos de tripulación 
const OPS_TRIPULACION = [
    { id: 1, name: "Daniel Alvaro Delgado" },
    { id: 2, name: "Pedro Guerrero Barria" },
    { id: 3, name: "Osvaldo Ojeda" },
    { id: 4, name: "Cludio Sanhueza Millatureo" },
    { id: 5, name: "Luis Gonzalez Talma" },
    { id: 6, name: "Hermi Vargas Garriel" },
];

// --- COMPONENTE DE ALERTA PERSONALIZADA ---
interface AlertProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error';
}

const CustomAlert: React.FC<AlertProps> = ({ isVisible, onClose, title, message, type }) => {
  const color = type === 'success' ? COLORS.success : COLORS.error;
  const iconName = type === 'success' ? 'check-circle' : 'alert-circle';

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.alertBoxCustom}>
          <MaterialCommunityIcons name={iconName} size={36} color={color} style={{ marginBottom: 10 }} />
          
          <Text style={[styles.alertTitle, { color: color }]}>
            {title}
          </Text>
          <Text style={styles.alertMessage}>
            {message}
          </Text>
          
          <TouchableOpacity style={[styles.alertButton, { backgroundColor: color }]} onPress={onClose}>
            <Text style={styles.alertButtonText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
// --- FIN COMPONENTE DE ALERTA PERSONALIZADA ---


export default function Formulario() {
  const [fecha, setFecha] = useState("");
  const [rutConductor, setRutConductor] = useState(""); 
  const [nombreConductor, setNameUser] = useState("");
  const [cargo, setCargoUser] = useState("");
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]); 
  const [ausente, setAusente] = useState("");
  // Controla si se espera el ingreso de nombres ausentes (True = SÍ hay ausentes)
  const [hayAusentes, setHayAusentes] = React.useState(true); 
  const [patente, setPatente] = useState("");

  // --- ESTADOS DE FOCUS ---
  const [isPatenteFocused, setIsPatenteFocused] = useState(false);
  const [isAusenteFocused, setIsAusenteFocused] = useState(false);

  // --- ESTADOS DEL MODAL DE ALERTA ---
  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: '', message: '', type: 'success' as 'success' | 'error' });

  const router = useRouter();
  const { signOut } = useAuth(); 

  // Lógica para alternar el control de ausentes
  const handleNoAusentesToggle = () => {
    const newState = !hayAusentes;
    setHayAusentes(newState);

    // Si se marca "No hay Ausentes" (newState = false), limpiamos el campo de texto
    if (!newState) {
      setAusente('');
      setIsAusenteFocused(false); 
    }
  };

  // Estilos dinámicos para el campo de texto de Ausente
  const ausenteInputStyle = [
    styles.input, 
    getFocusStyle(isAusenteFocused),
    // Estilo para deshabilitar visualmente el input
    !hayAusentes && styles.inputDisabled 
  ];

  // Cargar datos del login
  useEffect(() => {
    const cargarDatos = async () => {
      const hoy = dayjs().format("YYYY-MM-DD HH:mm:ss"); 
      setFecha(hoy);

      const rutGuardado = await AsyncStorage.getItem("rutUsuario");
      if (rutGuardado) setRutConductor(rutGuardado);
      const nameGuardado = await AsyncStorage.getItem("userName");
      if (nameGuardado) setNameUser(nameGuardado);
      const cargoGuardado = await AsyncStorage.getItem("userCargo");
      if (cargoGuardado) setCargoUser(cargoGuardado);
    };

    cargarDatos();
  }, []);

  // Manejador de selección de tripulante
  const toggleCrewMember = (name: string) => {
    setSelectedCrew(prev => {
        if (prev.includes(name)) {
            return prev.filter(n => n !== name);
        } else {
            return [...prev, name];
        }
    });
  };
  // --- LÓGICA DE ENVÍO Y VALIDACIÓN CORREGIDA ---
  const handleSubmit = () => {
    // 1. Validación de Patente (siempre requerida)
    const isPatenteInvalid = patente.trim().length === 0;

    // 2. Validación de Ausente (solo requerida si 'hayAusentes' está marcado)
    const isAusenteInvalid = hayAusentes && ausente.trim().length === 0;

    // 3. Validación de Tripulación (siempre requerida)
    const isCrewInvalid = selectedCrew.length === 0;

    if (isCrewInvalid || isAusenteInvalid || isPatenteInvalid) {
 
      let errorMessage = "Completa los siguientes campos obligatorios:\n\n";

      if (isCrewInvalid) errorMessage += "• Selección de Tripulación Presente\n";
      if (isPatenteInvalid) errorMessage += "• Patente de la Unidad de Transporte\n";
      if (isAusenteInvalid) errorMessage += "• Nombre(s) del Tripulante Ausente\n";

      // Mostrar Alerta de ERROR usando el modal
      setAlertContent({
        title: "🚨 Campos Requeridos",
        message: errorMessage.trim(),
        type: 'error',
      });
      setShowAlert(true);
      return;
    }

    //Si la pasa la validación de forma adecuada
    const datos = {
      fecha,
      rutConductor,
      nombreConductor,
      tripulacionPresente: selectedCrew.join(', '),
      ausenteReportado: ausente || "Ninguno", // Asignar "Ninguno" si el campo quedó vacío por el checkbox
      patente: patente.toUpperCase(),
    };

    console.log("Formulario enviado:", datos);
    
    // 🚨 Mostrar Alerta de ÉXITO usando el modal
    setAlertContent({
      title: "✅ Registro Guardado",
      message: "Los datos se han enviado y guardado correctamente.",
      type: 'success',
    });
    setShowAlert(true);
    
    // Aquí podrías agregar la lógica para enviar a una API o base de datos.
    // Aquí debe ir la lógica para LIMPIAR el formulario después del envío exitoso
    // setPatente(''); 
    // setAusente(''); 
    // setSelectedCrew([]); 
    // setHayAusentes(true); // Opcional: reiniciar estado de ausentes
  };
  
  const logout = async () => {
    await signOut(); 
    router.replace("/login");
  };

  return (
    <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.containerContent}
        automaticallyAdjustContentInsets={false} 
        contentInset={{ bottom: 80 }} 
      > 
      <View style={styles.container}>
        <Text style={styles.title}>Registro de Tripulación</Text>
        <Text style={styles.subtitle}>Información diaria de los acompañantes y la unidad de transporte.</Text>
        
        <View style = {styles.formCard}>
          
          {/* CAMPOS DE SÓLO LECTURA */}
          <View style={styles.field}>
            <Text style={styles.label}>Fecha y Hora</Text>
            <Text style={styles.value}>{fecha}</Text>
          </View>          
          <View style={styles.field}>
            <Text style={styles.label}>Usuario</Text>
            <Text style={styles.value}>
              {nombreConductor
                ? `${nombreConductor}   (${cargo || "Sin cargo"})`
                : "No disponible"}
            </Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>RUT</Text>
            <Text style={styles.value}>{rutConductor || "No disponible"}</Text>
          </View>
          {/* Separador de los campos SÓLO LECTURA con los demás*/}
          <View style={styles.separator} /> 
          
          {/* SELECCIÓN DE TRIPULACIÓN */}
          <Text style={styles.label}>Tripulación (Selecciona los presentes)</Text>
          <View style={styles.crewListContainer}>
            {OPS_TRIPULACION.map((crew) => {
              const isSelected = selectedCrew.includes(crew.name);
              return (
                  <TouchableOpacity
                      key={crew.id}
                      style={[styles.crewItem, isSelected && styles.crewItemSelected]}
                      onPress={() => toggleCrewMember(crew.name)}
                  >
                      {/* Checkbox Simulado con Iconos */}
                      <MaterialCommunityIcons
                          name={isSelected ? "checkbox-marked" : "checkbox-blank-outline"}
                          size={24}
                          color={isSelected ? COLORS.orange : COLORS.lightGray}
                      />
                      <Text style={[styles.crewText, isSelected && styles.crewTextSelected]}>
                          {crew.name}
                      </Text>
                  </TouchableOpacity>
              );
            })}
          </View>

          {/* CAMPO AUSENTE Y SU CONTROL (Limpio y sin duplicados) */}
          <Text style={styles.label}>Ausente (Nombres)</Text>
            {/* Checkbox Estético */}
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={handleNoAusentesToggle}
              activeOpacity={0.8}
              >
              <MaterialCommunityIcons 
                // Icono de círculo relleno para marcado, círculo vacío para desmarcado
                name={!hayAusentes ? 'radiobox-marked' : 'radiobox-blank'} 
                size={24} 
                color={!hayAusentes ? COLORS.softGreen : COLORS.lightGray} 
              />
              <Text 
                style={[
                  styles.checkboxLabel, 
                  // Color de texto verde si está marcado
                  { color: !hayAusentes ? COLORS.softGreen : COLORS.white }
                ]}
              >   
                No hay tripulación ausente.
              </Text>
            </TouchableOpacity>
            
            {/* Campo de Texto para Ausentes */}
            <TextInput
              style={[...ausenteInputStyle, styles.textArea]}
              value={ausente}
              onChangeText={setAusente}
              onFocus={() => setIsAusenteFocused(true)}
              onBlur={() => setIsAusenteFocused(false)}
              placeholder="Ej: Juan Pérez, María Soto (separados por coma)"
              placeholderTextColor={COLORS.lightGray}
              editable={hayAusentes} // Deshabilita la edición si 'No hay ausentes' está marcado
              multiline
              // Estilo para hacer el input más alto
              numberOfLines={4} 
             
            />
          {/*  
          
          {/* CAMPO PATENTE */}
          <Text style={styles.label}>Patente (Unidad de transporte)</Text>
          <TextInput
            style={[styles.input, getFocusStyle(isPatenteFocused)]}
            value={patente}
            onChangeText={setPatente}
            onFocus={() => setIsPatenteFocused(true)}
            onBlur={() => setIsPatenteFocused(false)}
            placeholder="Ej: GHJK12"
            placeholderTextColor={COLORS.lightGray}
            autoCapitalize="characters"
            maxLength={6}
          />

          {/* GRUPO DE BOTONES */}
          <View style={styles.buttonGroup}>
            
            {/* BOTÓN 1: GUARDAR (Naranja, color primario) */}
            <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Guardar Registro</Text>
            </TouchableOpacity>

            {/* BOTÓN 2: CERRAR SESIÓN (Rojo, color secundario/destructivo) */}
            <TouchableOpacity style={styles.secondaryButton} onPress={logout} activeOpacity={0.8}>
              <Text style={styles.buttonText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
        
      </View>
      
      {/* 🚨 INTEGRACIÓN DEL MODAL 🚨 */}
      <CustomAlert
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertContent.title}
        message={alertContent.message}
        type={alertContent.type}
      />
    </ScrollView>
  );
}
// --- ESTILOS MODIFICADOS ---
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.mainBackground 
  },
    containerContent: {
    
  },
  container: {
    paddingTop: 25,
    paddingLeft: 40, 
    paddingRight: 40, 
    
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginTop: 10,
    marginBottom: 5,
    textAlign:'left',
    color: COLORS.white
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.lightGray,
    marginBottom: 20,
    textAlign:'left',
    fontWeight: '500',
  },
  formCard: {
    backgroundColor: COLORS.cardBackground, 
    padding: 20,
    borderRadius: 12, 
    marginTop: 10,
    marginBottom: 30,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, 
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: COLORS.inputBorder, 
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.inputBorder,
    marginVertical: 15,
  },
  field: { 
    marginBottom: 5 
  },
  label: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginTop: 15,
    marginBottom: 8,
    color: COLORS.white
  },
  value: {
    fontSize: 18,
    color: COLORS.lightGray,
    
    fontWeight: '500',
  },
  input: {
    height: 48,
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: COLORS.white,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.inputBorder, 
  },
  inputFocused: {
    borderColor: COLORS.orange, 
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 8,
  },
  textArea: {
    height: 100, // Altura fija para el multiline
    textAlignVertical: 'top', // Para que el texto empiece arriba en Android
  },

  crewListContainer: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },
    crewItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.inputBorder,
    },
    crewItemSelected: {
      backgroundColor: 'rgba(255, 102, 0, 0.1)', 
    },
    crewText: {
      marginLeft: 15,
      fontSize: 16,
      color: COLORS.white,
      flex: 1,
    },
    crewTextSelected: {
      fontWeight: 'bold',
      color: COLORS.orange,
    },
  buttonGroup: {
    marginTop: 40,
  },
  primaryButton: {
    backgroundColor: COLORS.orange, 
    padding: 16, 
    borderRadius: 8, 
    alignItems: "center",
    marginBottom: 15,
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 10,
  },
  secondaryButton: {
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
    fontWeight: "600", 
    fontSize: 20,
  },
  // --- ESTILOS DEL MODAL PERSONALIZADO ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.modalBackground, // Fondo semi-transparente
  },
  alertBoxCustom: {
    width: '85%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
    shadowColor: COLORS.white,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 20,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: COLORS.lightGray,
    marginBottom: 30,
    textAlign: 'center',
  },
  alertButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  alertButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
// --- ESTILOS DE CHECKBOX MEJORADOS ---
  checkboxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15, // Espacio antes del TextInput
      paddingVertical: 5,
  },
  checkboxLabel: {
      marginLeft: 10,
      fontSize: 16,
      fontWeight: '500',
      color: COLORS.white,
  },
    inputDisabled: {
        backgroundColor: COLORS.inputBorder,
        opacity: 0.6,
    },
});