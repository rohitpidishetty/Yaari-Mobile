import React, { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function Code({ handleOtpSubmission, username }) {
  const [code, setCode] = useState("");
  const inputRef = useRef(null);
  const MAX_LENGTH = 5;


  const codeDigits = Array(MAX_LENGTH).fill(0);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Enter Code</Text>
        <Text style={styles.subtitle}>We've sent a 5-digit code to your email.</Text>

        <TextInput
          ref={inputRef}
          value={code}
          onChangeText={setCode}
          maxLength={MAX_LENGTH}
          keyboardType="number-pad"
          style={styles.hiddenInput}

        />

        <Pressable style={styles.codeContainer} onPress={handlePress}>
          {codeDigits.map((_, index) => {
            const char = code[index];
            const isFocused = code.length === index;
            return (
              <View
                key={index}
                style={[
                  styles.box,
                  isFocused && styles.boxFocused
                ]}
              >
                <Text style={styles.boxText}>{char || ""}</Text>
              </View>
            );
          })}
        </Pressable>
        <TouchableOpacity onPress={() => {
          handleOtpSubmission(code, username)
        }} style={styles.resendButton}>
          <Text style={styles.resendText}>Validate Code</Text>
        </TouchableOpacity>
        <Pressable style={styles.resendButton}>
          <Text style={styles.resendText}>Didn't get a code? Resend</Text>
        </Pressable>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    position: "absolute",

    top: '50%',
    left: '50%',

    transform: [
      { translateX: -150 },
      { translateY: -100 }
    ],
    width: 300,
    padding: "5%",
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 2,
    alignItems: "center",
    paddingTop: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    marginBottom: 10,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
  },
  codeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    paddingHorizontal: 1,
  },
  box: {
    width: 45,
    height: 45,
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    margin: 2,
    borderColor: "#2C2C2E",

  },
  boxFocused: {
    borderColor: "#007AFF",
    borderWidth: 2,
  },
  boxText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  resendButton: {
    marginTop: 20,
  },
  resendText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
});