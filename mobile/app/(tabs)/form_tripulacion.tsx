// app/(tabs)/formulario.tsx
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet, Alert, ScrollView} from "react-native";
import dayjs from "dayjs"; // npm install dayjs
import AsyncStorage from "@react-native-async-storage/async-storage"; // npm install @react-native-async-storage/async-storage
import { useRouter } from "expo-router";
// Importar useAuth para una limpieza correcta del estado
import { useAuth } from "../utils/AuthContext"; 
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Usaremos esto para el checkbox


// Paleta de Colores (Ajustada para usar en este formulario)
const COLORS = {
  black: '#000000', // Fondo principal
  darkestGray: '#1A1A1A', // Contenedor del formulario (Card)
  darkGray: '#333333', // Fondo de los Inputs
  inputBorder: '#333333', // Borde de inputs (mismo que fondo para efecto limpio)
  orange: '#FF6600', // Marca
  red: '#CC0000', // Alerta
  white: '#FFFFFF', // Texto
  lightGray: '#AAAAAA', // Placeholder/Texto secundario
};

// Datos de tripulación 
const OPS_TRIPULACION = [
    { id: 1, name: "Daniel Alvaro Delgado" },
    { id: 2, name: "Pedro Guerrero Barria" },
    { id: 3, name: "Osvaldo Ojeda" },
    { id: 4, name: "Cludio Sanhueza Millatureo" },
    { id: 5, name: "Luis Gonzalez Talma" },
    { id: 6, name: "Hermi Vargas Garriel" },
];


export default function Formulario() {
  const [fecha, setFecha] = useState("");
  const [rutConductor, setRutConductor] = useState(""); // Se asocia al login
  const [nombreConductor, setNameUser] = useState("");
  const [cargo, setCargoUser] = useState("");
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]); //Espera un array
  //Crew = tripulación
  const [ausente, setAusente] = useState("");
  const [patente, setPatente] = useState("");

  const router = useRouter();
  // 🚨 Usar useAuth para cerrar sesión
  const { signOut } = useAuth(); 

  const logout = async () => {
    // 🚨 Usar la función signOut del contexto: elimina AsyncStorage y actualiza el estado
    await signOut(); 
    router.replace("/login");
  };

  // Cargar fecha actual y rut guardado del login
  useEffect(() => {
    const cargarDatos = async () => {
      const hoy = dayjs().format("YYYY-MM-DD HH:mm");
      setFecha(hoy);

      // Recuperar RUT guardado del login
      const rutGuardado = await AsyncStorage.getItem("rutUsuario");
      if (rutGuardado) setRutConductor(rutGuardado);
      const nameGuardado = await AsyncStorage.getItem("userName");
      if (nameGuardado) setNameUser(nameGuardado);
      const cargoGuardado = await AsyncStorage.getItem("userCargo");
      if (cargoGuardado) setCargoUser(cargoGuardado);
    };

    cargarDatos();
  }, []);

  // Función para manejar la selección/deselección del tripulante
    const toggleCrewMember = (name: string) => {
        setSelectedCrew(prev => {
            if (prev.includes(name)) {
                // Si ya está, lo quitamos
                return prev.filter(n => n !== name);
            } else {
                // Si no está, lo añadimos
                return [...prev, name];
            }
        });
    };

  const handleSubmit = () => {
    if (selectedCrew.length === 0 || !ausente || !patente) {
      Alert.alert("Campos requeridos", "Completa todos los campos antes de enviar.");
      return;
    }

    const datos = {
      fecha,
      rutConductor,
      nombreConductor,
      // Guardamos la tripulación como una cadena separada por comas
      tripulacion: selectedCrew.join(', '),
      ausente,
      patente,
    };

    console.log("Formulario enviado:", datos);
    Alert.alert("Registro guardado", "Los datos se han enviado correctamente.");
    
  };

  return (
    // 🚨 Usar ScrollView para permitir el desplazamiento
    <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.containerContent}
          // Agrega un relleno extra para el área de las pestañas
          // La altura de las tabs es ~50, así que usamos un padding seguro de 80
          automaticallyAdjustContentInsets={false} // Para iOS
          contentInset={{ bottom: 80 }} // Para iOS
      > 
      <View style={styles.container}>
        <Text style={styles.title}>Registro de los acompañantes</Text>
        <View style = {styles.formCard}>
          {/* ... Campos de solo lectura (Fecha, Rut, Nombre) ... */}
          <View style={styles.field}>
            <Text style={styles.label}>📅 Fecha</Text>
            <Text style={styles.value}>{fecha}</Text>
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>RUR del Usuario</Text>
            <Text style={styles.value}>{rutConductor || "No disponible"}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nombre y rol del Usuario</Text>
            <Text style={styles.value}>
            {nombreConductor
              ? `${nombreConductor} (${cargo || "Sin cargo"})`
              : "No disponible"}
          </Text>
          </View>
          
          {/* ... Campos de entrada ... */}
          <Text style={styles.label}>Tripulación</Text>
          <View style={styles.crewListContainer}>
            {OPS_TRIPULACION.map((crew) => {
              const isSelected = selectedCrew.includes(crew.name);
              return (
                  <TouchableOpacity
                      key={crew.id}
                      style={styles.crewItem}
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

          <Text style={styles.label}>Ausente</Text>
          <TextInput
            style={styles.input}
            value={ausente}
            onChangeText={setAusente}
            placeholder="--"
          />

          <Text style={styles.label}>Patente</Text>
          <TextInput
            style={styles.input}
            value={patente}
            onChangeText={setPatente}
            placeholder="--"
          />

          {/* 🚨 BOTONES PERSONALIZADOS 🚨 */}
          <View style={styles.buttonGroup}>
            
            {/* BOTÓN 1: GUARDAR (Naranja, color primario de la marca) */}
            <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Guardar registro</Text>
            </TouchableOpacity>

            {/* BOTÓN 2: CERRAR SESIÓN (Rojo, color secundario) */}
            <TouchableOpacity style={styles.secondaryButton} onPress={logout}>
              <Text style={styles.buttonText}>Cerrar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
        
      </View>
    </ScrollView>
  );
}
// --- ESTILOS MODIFICADOS ---
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.black
  },
   containerContent: {
    // Relleno seguro en la parte inferior para contenido scrolleable
    paddingBottom: 20, 
  },
  container: {  
    padding: 20, 
  },
  // 2. CARD/CONTENEDOR DEL FORMULARIO (Donde aplicamos el estilo "flotante")
  formCard: {
    backgroundColor: COLORS.darkestGray, // Gris oscuro
    padding: 25,
    borderRadius: 10,
    marginTop: 20,
    marginBottom: 10,
    // 🚨 EFECTO DE SOMBRA NARANJA (El "borde brillante")
    shadowColor: COLORS.orange,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, // Opacidad baja para que sea sutil
    shadowRadius: 8,
    elevation: 8,
  },
  title: { 
    fontSize: 24, 
    fontWeight: "bold", 
    marginBottom: 20, 
    textAlign: "center",
    color: COLORS.white
  },
  field: { 
    marginBottom: 10 
  },
  label: { 
    fontSize: 14, 
    fontWeight: "600", 
    marginTop: 10,
    marginBottom: 10,
    color: COLORS.white
  },
  value: {
    fontSize: 16,
    color: COLORS.lightGray,
    paddingLeft: 5
  },
  input: {
    height: 48,
    backgroundColor: COLORS.darkGray,
    borderRadius: 8,
    paddingHorizontal: 15,
    color: COLORS.white, // Texto de entrada blanco
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.orange,
  },

    crewListContainer: {
      backgroundColor: COLORS.darkGray,
      borderRadius: 8,
      marginBottom: 15,
      paddingVertical: 5,
     
  },
    crewItem: {
        borderBottomColor: COLORS.darkestGray,
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        
    },
    crewText: {
        marginLeft: 10,
        fontSize: 16,
        color: COLORS.white,
    },
    crewTextSelected: {
        fontWeight: 'bold',
        color: COLORS.orange,
    },
  buttonGroup: {
    marginTop: 30,
    
  },
  primaryButton: {
    backgroundColor: COLORS.orange, 
    padding: 15, 
    borderRadius: 8, 
    alignItems: "center",
    marginBottom: 10 // Margen inferior para separarlo del botón de cerrar sesión
  },
  secondaryButton: {
    backgroundColor: COLORS.red, // Rojo para la acción destructiva (cerrar sesión)
    padding: 15, 
    borderRadius: 8, 
    alignItems: "center",
    marginTop: 5
  },
  buttonText: { 
    color: COLORS.white, 
    fontWeight: "bold",
    fontSize: 16
  },
});