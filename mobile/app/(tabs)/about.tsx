import { Text, View, StyleSheet } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Button } from "react-native";

export default function AboutScreen() {
  const router = useRouter();

  const logout = async () => {
    await AsyncStorage.removeItem("rutUsuario");
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>About screen</Text>
      <Button title="Cerrar sesión" onPress={logout} />
    </View>
   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
  },
});
