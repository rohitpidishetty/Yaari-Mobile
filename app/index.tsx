import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as FileSystem from "expo-file-system/legacy";
import { useRouter } from "expo-router";
import { initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";
import React, { useLayoutEffect, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch } from "react-redux";
import { mountUser } from "../yaari_redux/userSlice";
import { styles } from "./Styles/StyleSheet";
import Alert from "./alert";
import Code from "./code";
import { firebaseConfig } from "./fb.js";

export default function Index() {
  const app = initializeApp(firebaseConfig);

  const db = getDatabase();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [header, setHeader] = useState("");

  const dispatch = useDispatch();

  const [awaitForCode, setAwaitForCode] = useState(false);
  const [userPayload, setUserPayload] = useState({
    username: "",
    password: "",
  });

  async function login(username: string) {
    try {
      await AsyncStorage.setItem("user_token", username);
      router.push("/main");
    } catch (err) {
      setHeader("Oops!");
      setMessage("Some error occurred, please retry later");
      setShowModal(true);
    }
  }

  function handleOtpSubmission(otp: string, username: string) {
    axios
      .post(
        "https://yaari.vercel.app/yaari_two_step_verify/",
        {
          otp: otp,
          username: username,
        },
        {
          headers: { "Content-Type": "application/json" },
        },
      )
      .then((res) => {
        if (res.data.status == 200) {
          // Login
          login(username);
        } else {
          setHeader("Oops!");
          setMessage("Invalid OTP");
          setShowModal(true);
        }
      });
  }

  async function saveLoggedInUserLocally(payload: string) {
    const fileName = "user-log.txt";

    const path = FileSystem.documentDirectory + fileName;
    await FileSystem.writeAsStringAsync(path, payload);
  }

  function loginHandler(mode: string, un: string, pw: string) {
    if (mode == "UserMode" && (username.length == 0 || password.length == 0)) {
      setHeader("Oops!");
      setMessage(
        "The username or password that you entered is incorrect, please try again.",
      );
      setShowModal(true);
    } else {
      onValue(
        ref(db, "users/"),
        (snapshot) => {
          if (snapshot.exists()) {
            const collection = snapshot.val();
            const users = Object.keys(collection);

            if (!users.includes(mode === "ManualMode" ? un : username)) {
              setHeader("Unable to find user");
              setMessage(
                "User not found, kindly sign up to create an account!!",
              );

              setShowModal(true);
              return;
            }

            const userData = collection[mode === "ManualMode" ? un : username];

            if (userData.password !== (mode === "ManualMode" ? pw : password)) {
              setMessage("Incorrect password entered");
              setShowModal(true);
              return;
            }

            saveLoggedInUserLocally(
              JSON.stringify({
                username: userData.username,
                password: userData.password,
              }),
            );

            dispatch(mountUser(userData));

            if (userData.email_verified && mode === "UserMode") {
              setHeader("Welcome back!");
              setMessage("For security code please check your email inbox");
              setShowModal(true);
              setAwaitForCode(true);

              axios.post(
                "https://yaari.vercel.app/yaari_two_step_verification/",
                {
                  verify_email: userData.email,
                  username: username,
                },
                {
                  headers: { "Content-Type": "application/json" },
                },
              );
            } else {
              //  Login
              login(username);
            }
          } else {
            setHeader("Oops!");
            setMessage("User not found");
            setShowModal(true);
          }
        },
        { onlyOnce: true },
      );
    }
  }

  async function readLocallySavedUserIfAvailableAndLoginAutomatically() {
    try {
      const path = `${FileSystem.documentDirectory}/user-log.txt`;
      const content = await FileSystem.readAsStringAsync(path);
      var json = JSON.parse(content);
      setTimeout(() => {
        loginHandler("ManualMode", json.username, json.password);
      }, 0);
    } catch (err) {
      console.log(err);
    }
  }

  useLayoutEffect(() => {
    readLocallySavedUserIfAvailableAndLoginAutomatically();
  }, []);

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
        <Text style={[styles.header, themeTextStyle]}>
          Yaari - जीवनस्य क्षणं स्पृहय
        </Text>

        <View style={[styles.inputGroup, themeInputGroupStyle]}>
          <TextInput
            onChangeText={(text) => setUsername(text)}
            style={[styles.input, themeInputStyle]}
            placeholder="Username"
            placeholderTextColor={isDarkMode ? "#8E8E93" : "#A1A1A6"}
          />
          <View
            style={[styles.separator, isDarkMode && styles.darkSeparator]}
          />
          <TextInput
            onChangeText={(text) => setPassword(text)}
            style={[styles.input, themeInputStyle]}
            placeholder="Password"
            placeholderTextColor={isDarkMode ? "#8E8E93" : "#A1A1A6"}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          onPress={() => loginHandler("UserMode", "", "")}
          style={styles.appleButton}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Sign In</Text>
        </TouchableOpacity>

        <View
          style={[
            styles.separator,
            isDarkMode && styles.darkSeparator,
            { marginTop: 10, marginBottom: 10 },
          ]}
        />
        <View style={styles.footer}>
          <Text
            style={[
              styles.footerText,
              isDarkMode ? { color: "#8E8E93" } : { color: "#636366" },
            ]}
          >
            Don't have an account?
          </Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.linkText}>Sign Up</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.textButton}>
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      {awaitForCode && (
        <Code handleOtpSubmission={handleOtpSubmission} username={username} />
      )}

      <Alert
        message={message}
        setShowModal={setShowModal}
        showModal={showModal}
        header={header}
      />
    </SafeAreaView>
  );
}
