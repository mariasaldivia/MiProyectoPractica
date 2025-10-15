// app/(tabs)/formulario.tsx
import React, { useEffect, useState } from "react";
import { 
  // Componentes visuales principales
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  // Estilos
  StyleSheet, 
   Pressable,
  // Componentes adicionales
  Modal,    // Ventanas emergentes
  Animated, // Transiciones y animaciones suaves
} from "react-native";
// Librería para manejo de fechas (requiere instalación: npm install dayjs, no incluida en React Native)
import dayjs from "dayjs"; 
// Librería para almacenamiento persistente en Expo/React Native (requiere instalación: npm install @react-native-async-storage/async-storage)
import AsyncStorage from "@react-native-async-storage/async-storage"; 
// Hook para navegación en Expo Router
import { useRouter } from "expo-router";
// Hook personalizado que proporciona la información del usuario loggeado y funciones de autenticación
import { useAuth } from "../utils/AuthContext"; 
import { MaterialCommunityIcons } from '@expo/vector-icons';

// PALETA DE COLORES 
const COLORS = {
  mainBackground: '#101014', 
  cardBackground: '#1A1A22',  
  inputBackground: '#121218', 
  containerPartTime: '#141421ff',
  inputBorder: '#a1a1a1d2', 
  orange: '#FF6600',  // Color de énfasis/principal
  red: '#DA291C', 
  white: '#FFFFFF', 
  lightGray: '#AAAAAA', 
  // Colores para estados de alerta
  success: '#3CB371', // Verde suave para éxito
  error: '#DA291C', // Rojo para error
  modalBackground: 'rgba(0, 0, 0, 0.7)', // Fondo semi-transparente del modal
  // Verde suave, usado para el checkbox "No hay..."
  softGreen: '#3CB371',
  lightGreenBackground: 'rgba(40, 167, 69, 0.15)', // Fondo verde muy sutil
  lightRedBackground: 'rgba(220, 53, 69, 0.15)', // Fondo rojo sutil
};

// FUNCIONES DE ESTILO DINÁMICO
// Aplica el estilo de borde y sombra (focus) a los TextInput individuales
const getFocusStyle = (isFocused: boolean) => ({
  borderColor: isFocused ? COLORS.orange : COLORS.inputBorder, // Usa el color de foco
  borderWidth: isFocused ? 2 : 1, 
  borderRadius: 8, // Añadimos un borde redondeado
  shadowColor: isFocused ? COLORS.orange : 'transparent',
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: isFocused ? 0.8 : 0, // Sombra más visible en el contenedor
  shadowRadius: isFocused ? 10 : 0,
  elevation: isFocused ? 5 : 0,
});

// Datos estáticos de tripulación 
const OPS_TRIPULACION = [
  { id: 1, name: "Daniel Alvaro Delgado" },
  { id: 2, name: "Pedro Guerrero Barria" },
  { id: 3, name: "Osvaldo Ojeda" },
  { id: 4, name: "Cludio Sanhueza Millatureo" },
  { id: 5, name: "Luis Gonzalez Talma" },
  { id: 6, name: "Hermi Vargas Garriel" },
];

//  COMPONENTE DE ALERTA PERSONALIZADA (CustomAlert) 
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
      onRequestClose={onClose} // Permite cerrar con el botón de retroceso de Android
      >
      <View style={styles.modalOverlay}>
        <View style={styles.alertBoxCustom}>
          <MaterialCommunityIcons name={iconName} size={36} color={color} style={{ marginBottom: 10 }} />  
          <Text style={[styles.alertTitle, { color: color }]}> {title}</Text>
          <Text style={styles.alertMessage}> {message}</Text>
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
  // ESTADOS DEL FORMULARIO - inician limpios
  const [fecha, setFecha] = useState("");
  const [rutConductor, setRutConductor] = useState(""); // RUT del conductor (cargado de AsyncStorage)
  const [nombreConductor, setNameUser] = useState(""); // Nombre del conductor (cargado de AsyncStorage)
  const [cargo, setCargoUser] = useState(""); // Cargo "conductor" (cargado de AsyncStorage)
  //INFORMACIÓN de la TRIPULACIÓN
  //ANTES const [selectedCrew, setSelectedCrew] = useState<string[]>([]); // Lista de nombres de tripulantes presentes
  // Ahora (usando un objeto para rastrear el estado de cada persona):
  const [crewAttendance, setCrewAttendance] = useState<Record<string, 'Presente' | 'Ausente'>>({});
  //AUSENTES

  // Controla si el campo 'ausente' debe estar activo y validarse (True por defecto)
  const [hayAusentes, setHayAusentes] = React.useState(true); 
  //Campos de datos para Part Time
  const [partTimerRUT, setPartTimeRUT] = useState("");
  const [partTimePrimerNombre, setPartTimePrimerNombre] = useState("");
  const [partTimeSegundoNombre, setPartTimeSegundoNombre] = useState("");
  const [partTimePrimerApellido, setPartTimePrimerApellido] = useState("");
  const [partTimeSegundoApellido, setPartTimeSegundoApellido] = useState("");
  //Controla si los campos Part Time deben estar activos (True por defecto)
  const [hayPartTimes, setHayPartimes] = React.useState(true); 

  //Patente
  const [patente, setPatente] = useState("");

  // --- ESTADOS DE FOCUS ---
  const [isPatenteFocused, setIsPatenteFocused] = useState(false);
  const [isAusenteFocused, setIsAusenteFocused] = useState(false);
  const [isPartTimeFocused, setIsPartTimeFocused] = useState(false);

  // --- ESTADOS DEL MODAL DE ALERTA ---
  const [showAlert, setShowAlert] = useState(false);
  const [alertContent, setAlertContent] = useState({ 
    title: '', 
    message: '', 
    type: 'success' as 'success' | 'error' 
  });

  const router = useRouter(); // Navegación
  const { signOut } = useAuth(); // Función para cerrar sesión

  // CONFIRMACIÓN DEL FORMULARIO
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dataToConfirm, setDataToConfirm] = useState<any>(null);

  
  // Lógica para alternar el control de personal PART TIME
  const handleNoPartTimesToggle = () => {
    const newState = !hayPartTimes;
    setHayPartimes(newState);

    // Si se marca "No hay PART TIMES" (newState = false), limpiamos el campo de texto
    if (!newState) {
      setPartTimeRUT('');
      setPartTimePrimerNombre('');
      setPartTimeSegundoNombre('');
      setPartTimePrimerApellido('');
      setPartTimeSegundoNombre('');
      setIsPartTimeFocused(false); 
    }
  };



  // Estilos dinámicos para el campo de texto de Part time
  const partTimeInputStyle = [
    styles.input, 
    !hayPartTimes && styles.inputDisabled // Estilo de deshabilitado
  ];

  // HOOK DE EFECTO (Carga de Datos Iniciales)
  useEffect(() => {
    const cargarDatos = async () => {
      // 1. Establecer fecha y hora actual
      const hoy = dayjs().format("YYYY-MM-DD HH:mm:ss"); 
      setFecha(hoy);
      // 2. Cargar datos del usuario guardados durante el login
      const rutGuardado = await AsyncStorage.getItem("rutUsuario");
      if (rutGuardado) setRutConductor(rutGuardado);
      const nameGuardado = await AsyncStorage.getItem("userName");
      if (nameGuardado) setNameUser(nameGuardado);
      const cargoGuardado = await AsyncStorage.getItem("userCargo");
      if (cargoGuardado) setCargoUser(cargoGuardado);
      //La tripulación inicia como ausente
      // Inicializar a todos como 'Ausente' al cargar el componente
      const initialAttendance = OPS_TRIPULACION.reduce((acc, crew) => {
        acc[crew.name] = 'Ausente';
        return acc;
      }, {} as Record<string, 'Presente' | 'Ausente'>);
      setCrewAttendance(initialAttendance);
      };

    cargarDatos();
  }, []); // El array vacío asegura que esto solo se ejecute al montar el componente

  // Función debe cambiar el estado binario de la persona:
  const toggleCrewMember = (Crewname: string) => {
    setCrewAttendance(prev => {
        const currentState = prev[Crewname];
        const newState = currentState === 'Presente' ? 'Ausente' : 'Presente';

        return {
            ...prev,
            [Crewname]: newState,
        };
    });
  }; 

// 🚨 Función que maneja el envío final (la nueva)
const handleConfirmSubmit = () => {
    if (!dataToConfirm) return;

    // Aquí va la lógica real de guardado (ej: API call, guardar en storage, etc.)
    console.log("✅ Datos Verificados y Guardados:", dataToConfirm);
    
    // Cierra el modal y limpia el estado de confirmación
    setShowConfirmModal(false);
    setDataToConfirm(null);

    // Opcional: Mostrar un mensaje de éxito final al usuario
    // ...
};
  // --- LÓGICA DE ENVÍO Y VALIDACIÓN CORREGIDA ---
  const handleSubmit = () => {
    // 1. Validación de Patente (siempre requerida)
    const isPatenteInvalid = patente.trim().length === 0;

    // 2. Validación de Ausente (requerida SÓLO si hayAusentes está en True)
  //  const isAusenteInvalid = hayAusentes && ausente.trim().length === 0;
//--ANTES
    // 3. Validación de Tripulación (siempre requerida)
   // const isCrewInvalid = selectedCrew.length === 0;
   // ---FIN ANTES
    // Validación de Tripulación: ¿Hay al menos un miembro marcado como 'Presente'?
    // Convertimos el objeto crewAttendance en un array de sus valores y filtramos por 'Presente'.
    // Si la longitud es 0, significa que nadie ha sido marcado como presente.
    const hasAtLeastOnePresent = Object.values(crewAttendance).some(status => status === 'Presente');
    const isCrewInvalid = !hasAtLeastOnePresent; // Es inválido si NO hay al menos uno presente

    // 4. Construcción del mensaje de error si falla alguna validación
    if ( isPatenteInvalid || isCrewInvalid) {
 
      let errorMessage = "Completa los siguientes campos obligatorios:\n\n";

      if (isCrewInvalid) errorMessage += "• Debes catalogar al menos un miembro de la tripulación como 'Presente'.\n"; // Mensaje actualizado
      if (isPatenteInvalid) errorMessage += "• Patente de la Unidad de Transporte\n";
     
      // Mostrar Alerta de ERROR usando el modal
      setAlertContent({
        title: "🚨 Campos Requeridos",
        message: errorMessage.trim(),
        type: 'error',
      });
      setShowAlert(true);
      return; // Detiene la ejecución si hay errores
    }

    // Si la validación es exitosa:
    // 5. Preparar los datos 
    // Prepara las listas de presentes y ausentes a partir de crewAttendance
    
    const crewPresentNames: string[] = [];
    const crewAbsentNames: string[] = [];

    for (const crewName in crewAttendance) {
      if (crewAttendance[crewName] === 'Presente') {
        crewPresentNames.push(crewName);
      } else {
        crewAbsentNames.push(crewName);
      }
    }

    //Si la pasa la validación es EXITOSA
    const datos = {
      fecha,
      rutConductor,
      nombreConductor,
      cargo, //OPCIONAL
      // Une los nombres seleccionados en un solo string
     // tripulacionPresente: selectedCrew.join(', '),
      // Si 'ausente' está vacío (porque se marcó 'No hay'), guarda "Ninguno"
      // Ahora almacenamos los nombres de la tripulación de forma más clara:
      tripulacionPresente: crewPresentNames.length > 0 ? crewPresentNames.join('\n') : "Ninguno",
      // Nueva propiedad para la tripulación listada como ausente
      tripulacionAusente: crewAbsentNames.length > 0 ? crewAbsentNames.join('\n') : "Ninguno",


    //  ausenteReportado: ausente || "Ninguno", // Asignar "Ninguno" si el campo quedó vacío por el checkbox
      patente: patente.toUpperCase(), //La patente se guardara con mayúscula
      //Datos de Part Time
      partTimerRUT,
      partTimePrimerNombre,
      partTimeSegundoNombre,
      partTimePrimerApellido,
      partTimeSegundoApellido,
    };
    //PARA VERIFICAR LOS DATOS luego se quita
    console.log("Formulario enviado:", datos);
    // 🚨 Abrir el modal de confirmación
    setDataToConfirm(datos);
    setShowConfirmModal(true);
    
  
    // Aquí podrías agregar la lógica para enviar a una API o base de datos y limpieza
  };

  //Función para cerrar sesión y navegar a /login
  const logout = async () => {
    await signOut(); 
    router.replace("/login");
  };
  // RENDERIZADO DEL COMPONENTE (Lo que se VE)
  return (
    <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.containerContent}
        // Propiedades para asegurar el ajuste de la scrollbar
        automaticallyAdjustContentInsets={false} 
        contentInset={{ bottom: 80 }} 
      > 
      <View style={styles.container}>
        <Text style={styles.title}>Registro de Tripulación</Text>
        <Text style={styles.subtitle}>Información diaria de los acompañantes y la unidad de transporte.</Text>
        
        <View style = {styles.formCard}>
          
          {/* Sección de DATOS DE SÓLO LECTURA */}
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
              const isPresent = crewAttendance[crew.name] === 'Presente';
              return (
                <TouchableOpacity
                  key={crew.id}
                  style={[
                    styles.crewItem, 
                    isPresent ? styles.crewItemPresent : styles.crewItemAbsent ]}
                  onPress={() => toggleCrewMember(crew.name)}
                >
                  <MaterialCommunityIcons
                    name={isPresent ? "check-circle" : "close-circle"}
                    size={24}
                    color={isPresent ? COLORS.softGreen : COLORS.red}
                  />
                  <Text style={[
                    styles.crewText, 
                    isPresent ? styles.crewTextPresent : styles.crewTextAbsent 
                    ]}>
                      {crew.name}
                      {/* Opcional: Mostrar el estado al lado del nombre */}
                      <Text style={{fontWeight: 'bold'}}> ({crewAttendance[crew.name]})</Text>
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View> 

            {/* SECCIÓN DE AUXILIARES PART TIME */}
            <Text style={styles.label}>Auxiliares Part Time </Text>
            {/* Checkbox para "No hay auxiliares PART TIME" */}
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={handleNoPartTimesToggle}
              activeOpacity={0.8}
              >
              <MaterialCommunityIcons 
                name={!hayPartTimes ? 'radiobox-marked' : 'radiobox-blank'} 
                size={24} 
                color={!hayPartTimes ? COLORS.softGreen : COLORS.lightGray} 
              />
              <Text 
                style={[
                  styles.checkboxLabel, 
                  // Color de texto verde si está marcado
                  { color: !hayPartTimes ? COLORS.softGreen : COLORS.white }
                ]}
                >   
                No hay auxiliares PART TIME
              </Text>
            </TouchableOpacity>
            {/* CONTENEDOR DE DATOS DEL AUXILIAR PART TIME */}
            <View 
              style={[
                styles.containerDatosAuxiliar,
                // Estilo de foco al contenedor padre
                getFocusStyle(isPartTimeFocused) 
              ]}
            >
            <Text style={styles.labelPartTime}>RUT</Text>
            <TextInput
            // Aplicación de estilo base y estilo de foco individual
              style={[...partTimeInputStyle]}
              value={partTimerRUT}
              onChangeText={setPartTimeRUT}
              onFocus={() => setIsPartTimeFocused(true)}
              onBlur={() => setIsPartTimeFocused(false)}
              placeholder="RUT"
              placeholderTextColor={COLORS.lightGray}
              editable={hayPartTimes} // Deshabilita la edición si 'No hay PART TIMES' está marcado
            />
            {/* --- SUBCONTENEDOR 1: NOMBRES --- */}
            <Text style={styles.labelPartTime}>Nombre completo</Text>
            <View style={styles.subContainerGroup}>
              
              <TextInput
                style={[
                  ...partTimeInputStyle, 
                  { 
                    flex: 1, // Opcional, pero asegura que ocupa el espacio.
                    marginBottom: 10, // Margen inferior para separarse del siguiente input
                    marginRight: 0, // Asegura que no tenga margen derecho sobrante
                    padding: 10
                  } 
                ]}
                value={partTimePrimerNombre}
                onChangeText={setPartTimePrimerNombre}
                onFocus={() => setIsPartTimeFocused(true)}
                onBlur={() => setIsPartTimeFocused(false)}
                placeholder="Nombre"
                placeholderTextColor={COLORS.lightGray}
                editable={hayPartTimes}
              />
              <TextInput
                style={[
                  ...partTimeInputStyle, 
                  // ESTILO DE RESPONSIVIDAD REQUERIDO:
                  { flex: 1, marginLeft: 0, padding: 10 }
                ]}
                value={partTimeSegundoNombre}
                onChangeText={setPartTimeSegundoNombre}
                onFocus={() => setIsPartTimeFocused(true)}
                onBlur={() => setIsPartTimeFocused(false)}
                placeholder="Segundo nombre"
                placeholderTextColor={COLORS.lightGray}
                editable={hayPartTimes}
              />
            </View>
            {/* --- SUBCONTENEDOR 2: APELLIDOS --- */}
            <Text style={styles.labelPartTime}>Apellidos</Text>
            <View style={styles.subContainerGroup}>
              
              <TextInput
                style={[
                  ...partTimeInputStyle, 
                  { flex: 1, marginBottom:10, marginRight: 0, padding: 10}
                ]}
                value={partTimePrimerApellido}
                onChangeText={setPartTimePrimerApellido}
                onFocus={() => setIsPartTimeFocused(true)}
                onBlur={() => setIsPartTimeFocused(false)}
                placeholder="Primer apellido"
                placeholderTextColor={COLORS.lightGray}
                editable={hayPartTimes} // Deshabilita la edición si 'No hay PART TIMES' está marcado
              />
              <TextInput
                style={[
                  ...partTimeInputStyle, 
                  { flex: 1, marginLeft: 0, padding: 10}
                ]}
                value={partTimeSegundoApellido}
                onChangeText={setPartTimeSegundoApellido}
                onFocus={() => setIsPartTimeFocused(true)}
                onBlur={() => setIsPartTimeFocused(false)}
                placeholder="Segundo apellido"
                placeholderTextColor={COLORS.lightGray}
                editable={hayPartTimes} // Deshabilita la edición si 'No hay PART TIMES' está marcado
              />
            </View>
            </View>
            </View>

          
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
        
    
      
      {/* MODAL DE ALERTA PERSONALIZADO */}
      <CustomAlert
        isVisible={showAlert}
        onClose={() => setShowAlert(false)}
        title={alertContent.title}
        message={alertContent.message}
        type={alertContent.type}
      />

              {/* 🚨 Modal de Confirmación de Datos */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={showConfirmModal}
            onRequestClose={() => setShowConfirmModal(false)}
        >
            <View style={modalStyles.centeredView}>
                <View style={modalStyles.modalView}>
                    <Text style={modalStyles.modalTitle}>Verifica los Datos a Guardar</Text>
                    
                    <ScrollView style={modalStyles.dataScrollView}>
                        {dataToConfirm && (
                            <>
                                {/* Sección de Datos Principales */}
                                <Text style={modalStyles.dataHeader}>DATOS PRINCIPALES</Text>
                                <Text style={modalStyles.dataText}>Fecha y hora:</Text>
                                <Text style={modalStyles.dataContent}>{dataToConfirm.fecha}</Text>
                                <Text style={modalStyles.dataText}>Conductor:</Text>
                                <Text style={modalStyles.dataContent}>{dataToConfirm.nombreConductor}</Text>
                                <Text style={modalStyles.dataContent}>RUT: {dataToConfirm.rutConductor}</Text>
                                <Text style={modalStyles.dataText}>Camión</Text>
                                <Text style={modalStyles.dataContent}>Patente: {dataToConfirm.patente}</Text>

                                {/* Sección de Tripulación */}
                                <Text style={modalStyles.dataHeader}>ASISTENCIA TRIPULACIÓN</Text>
                                <Text style={modalStyles.dataText}>Presentes:</Text>
                                <Text style={modalStyles.dataContent}>
                                  {dataToConfirm.tripulacionPresente}
                                </Text>
                                <Text style={modalStyles.dataText}>Ausentes:</Text>
                                <Text style={modalStyles.dataContent}>
                                  {dataToConfirm.tripulacionPresente}
                                </Text>

                                {/* Sección de Part Time (Ejemplo) */}
                                {dataToConfirm.partTimerRUT && (
                                    <>
                                        <Text style={modalStyles.dataHeader}>AUXILIAR PART TIME</Text>
                                        <Text style={modalStyles.dataText}>RUT: {dataToConfirm.partTimerRUT}</Text>
                                        {/* ... Añade más campos Part Time aquí ... */}
                                    </>
                                )}
                            </>
                        )}
                    </ScrollView>

                    {/* Botones de Acción */}
                    <View style={modalStyles.buttonContainer}>
                        <Pressable
                            style={[modalStyles.button, modalStyles.buttonCancel]}
                            onPress={() => setShowConfirmModal(false)}
                        >
                            <Text style={modalStyles.textStyle}>Modificar</Text>
                        </Pressable>
                        <Pressable
                            style={[modalStyles.button, modalStyles.buttonConfirm]}
                            onPress={handleConfirmSubmit}
                        >
                            <Text style={modalStyles.textStyle}>Confirmar y Guardar</Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    </ScrollView>
  );
}
// --- ESTILOS COMPLEMENTARIOS (CRUCIALES PARA LA RESPONSIVIDAD) ---
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
  containerDatosAuxiliar: {
    paddingTop: 15,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: COLORS.containerPartTime,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 15,
    borderWidth: 1, 
    borderColor: COLORS.inputBorder,
  },
  
    // Estilo para las etiquetas de grupo (Nombre completo, Apellidos)
    labelGroup: { 
        fontSize: 18, 
        fontWeight: "600", 
        marginTop: 15, // Más espacio arriba para separarse
        marginBottom: 8,
        color: COLORS.white
    },

subContainerGroup: {
  flexDirection: 'column', // Orienta los elementos hijos en una fila
  marginTop:8
},
    label: { 
    fontSize: 18, 
    fontWeight: "600", 
    marginTop: 15,
    marginBottom: 8,
    color: COLORS.white
  },
  labelPartTime: { 
    fontSize: 16,
    fontWeight: "400", 
    marginTop: 20,
    marginBottom: 5,
    color: COLORS.white
    
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

    crewItemSelected: {
      backgroundColor: 'rgba(255, 102, 0, 0.1)', 
    },

    crewTextSelected: {
      fontWeight: 'bold',
      color: COLORS.orange,
    },
  buttonGroup: {
    marginTop: 40,
    marginBottom:40,
  },
  primaryButton: {
    backgroundColor: COLORS.orange, 
    padding: 16, 
    borderRadius: 8, 
    alignItems: "center",
    marginBottom: 20,
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

  crewItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 8,
      marginBottom: 10,
    backgroundColor: COLORS.cardBackground, // Fondo base, se sobrescribe por presente/ausente
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
  },

  crewItemPresent: {
    // Estilo cuando está Presente
    backgroundColor: COLORS.lightGreenBackground, // Fondo verde muy sutil
    borderColor: COLORS.softGreen,
    borderWidth: 1,
},
crewItemAbsent: {
    // Estilo cuando está Ausente
    backgroundColor: COLORS.lightRedBackground, // Fondo rojo sutil
    borderColor: COLORS.red,
},
crewText: { // Estilo base del texto
    flex: 1, // Para que el texto ocupe el espacio restante
    fontSize: 16,
    marginLeft: 10,
    color: COLORS.white, // Color base, se sobrescribe
  },
crewTextPresent: {
    color: COLORS.softGreen,
},
crewTextAbsent: {
    color: COLORS.red,
},

  buttonDisabled: {
    backgroundColor: COLORS.inputBorder, // Color oscuro cuando está inactivo
    shadowOpacity: 0.2,
    elevation: 0,
  },
});

const modalStyles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Fondo semi-transparente
    },
    modalView: {
        margin: 20,
        backgroundColor: "#2b2b2b", // Fondo oscuro para el modal
        borderRadius: 10,
        padding: 25,
        alignItems: "stretch", // Para que los elementos internos ocupen el ancho
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '90%',
        maxHeight: '80%',
    },
    modalTitle: {
        marginBottom: 15,
        textAlign: "center",
        fontSize: 20,
        fontWeight: "bold",
        color: COLORS.orange, // Tu color de énfasis
    },
    dataScrollView: {
        maxHeight: 300, // Limita la altura de la lista de datos
        marginBottom: 15,
        paddingRight: 5, // Espacio para el scrollbar
    },
    dataHeader: {
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
        color: '#f2f2f2',
        borderBottomWidth: 1,
        borderBottomColor: '#5d5d5dff',
    },
    dataText: {
        fontSize: 16,
        color: '#bbbbbb',
        marginBottom: 3,
        fontWeight: 'bold', 

    },
        dataContent: {
        fontSize: 16,
        color: '#f5f5f5',
        marginBottom: 8,
        paddingLeft: 15, // Pequeña indentación
        // Asegúrate de que este estilo exista si lo usas arriba
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
    },
    button: {
        borderRadius: 8,
        padding: 10,
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
    },
    buttonCancel: {
        backgroundColor: '#444', // Gris
    },
    buttonConfirm: {
        backgroundColor: COLORS.softGreen, // Verde para confirmar
    },
    textStyle: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    }
});