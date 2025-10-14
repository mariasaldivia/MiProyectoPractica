import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuth } from "../utils/AuthContext";
import Entypo from '@expo/vector-icons/Entypo';
import AntDesign from '@expo/vector-icons/AntDesign';
import { View, Text } from 'react-native'; // 👈 Importar View y Text

export default function TabLayout() {

// 🚨 Ejecutamos el hook para obtener el cargo 🚨
const { userCargo, isLoading } = useAuth(); 

// 🚨 ATENCIÓN: El rol debe coincidir exactamente con lo que guardaste en el login 🚨
  const COORDINADOR_ROLE = 'Coordinador de flota'; 
  const isCoordinator = userCargo === COORDINADOR_ROLE; // True o False

  // 🚨 ATENCIÓN: El rol debe coincidir exactamente con lo que guardaste en el login 🚨
  const CONDUCTOR_ROLE = 'Conductor'; 
  const isConductor = userCargo === CONDUCTOR_ROLE; // True o False

  if (isLoading) {
    // Evita errores de renderizado mientras se carga el userCargo desde AsyncStorage
    return null; 
  }
  console.log("userCargo:", userCargo);
  console.log("isCoordinator:", isCoordinator);

  return (
    <Tabs
    screenOptions={{
        tabBarActiveTintColor: '#fd8f4fff',
        headerStyle: {
        backgroundColor: '#25292e',
        },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        tabBarStyle: {
        backgroundColor: '#25292e',
        },
    }}
    >

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
          //  <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          //<Ionicons name="checkmark-circle" size={32} color="green" />
            //<Entypo name="home" size={24} color="black" />
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} size={24} color={color} />
  
          ),
        }}
      />

      <Tabs.Screen
        name="about"
        options={{
          title: 'About',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'information-circle' : 'information-circle-outline'} color={color} size={24}/>
          ),
        }}
      />
      {/* 🚨 SOLUCIÓN: Renderizado condicional para ocultar la pestaña 🚨 */}

        <Tabs.Screen
          name="panel_flota"
          options={{
            href: isCoordinator ? '/panel_flota' : null, // 👈 Si no es coordinador, la ruta es null
            title: 'Panel de control',
            tabBarIcon: ({ color, focused }) => (
            //  <Ionicons name={focused ? 'clipboard-sharp' : 'clipboard-outline'} color={color} size={24} />
              <AntDesign name="control" size={24} color={color} />
          ),
         
        }}
        />
      
  
     <Tabs.Screen
        name="form_tripulacion"
        options={{
          href: isConductor ? '/form_tripulacion' : null,
          title: 'Formulario',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'clipboard-sharp' : 'clipboard-outline'} color={color} size={24} />
          ),
        }}
      />

      </Tabs>
  )

}
