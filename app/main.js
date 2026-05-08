import { useRouter } from "expo-router";
import { Text, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Footer from "./footer";
import { styles } from "./Styles/StyleSheet";


export default function Main() {

   const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === "dark";
    const router = useRouter();
  
    const themeContainerStyle = isDarkMode
      ? styles.darkContainer
      : styles.lightContainer;
    const themeInputGroupStyle = isDarkMode
      ? styles.darkInputGroup
      : styles.lightInputGroup;
    const themeTextStyle = isDarkMode ? styles.darkText : styles.lightText;
    const themeInputStyle = isDarkMode ? styles.darkInput : styles.lightInput;

  return (
    <SafeAreaView style={[styles.container, themeContainerStyle]}>
      <Footer />
      <Text>User</Text>
    </SafeAreaView>
  )
}