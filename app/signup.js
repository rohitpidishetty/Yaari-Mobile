import { useRouter } from "expo-router";
import React from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "./Styles/StyleSheet.js";

export default function Signup() {
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
      <View style={styles.wrapper}>
        <Text style={[styles.header, themeTextStyle]}>Signup</Text>

        <View style={[styles.inputGroup, themeInputGroupStyle]}>
          <TextInput
            style={[styles.input, themeInputStyle]}
            placeholder="Username"
            placeholderTextColor={isDarkMode ? "#8E8E93" : "#A1A1A6"}
          />
          <View
            style={[styles.separator, isDarkMode && styles.darkSeparator]}
          />
          <TextInput
            style={[styles.input, themeInputStyle]}
            placeholder="Email"
            placeholderTextColor={isDarkMode ? "#8E8E93" : "#A1A1A6"}
          />
          <View
            style={[styles.separator, isDarkMode && styles.darkSeparator]}
          />
          <TextInput
            style={[styles.input, themeInputStyle]}
            placeholder="Phone"
            placeholderTextColor={isDarkMode ? "#8E8E93" : "#A1A1A6"}
            keyboardType="numeric"
          />
          <View
            style={[styles.separator, isDarkMode && styles.darkSeparator]}
          />

          <TextInput
            style={[styles.input, themeInputStyle]}
            placeholder="Password"
            placeholderTextColor={isDarkMode ? "#8E8E93" : "#A1A1A6"}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.appleButton} activeOpacity={0.8}>
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>

        <View
          style={[

            { marginTop: 10, marginBottom: 10 },
          ]}
        />

        <View style={styles.footer}>
          <Text style={[styles.footerText, isDarkMode ? { color: '#8E8E93' } : { color: '#636366' }]}>
            Already have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push("/")}>
            <Text style={styles.linkText}> Sign In</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.textButton}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
