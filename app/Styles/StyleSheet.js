import { StyleSheet } from "react-native";


export const styles = StyleSheet.create({
  container: { flex: 1 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  footerText: {
    fontSize: 15,
  },
  wrapper: { paddingHorizontal: 20, paddingTop: 60 },
  header: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: 0.4,
    marginBottom: 30,
    textAlign: "center"
  },
  inputGroup: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 25,
  },
  linkText: {
    fontSize: 15,
    color: "#007AFF",
    fontWeight: "600",
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  appleButton: {
    backgroundColor: "#007AFF",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  textButton: { marginTop: 20, alignItems: "center" },
  forgotText: { color: "#007AFF", fontSize: 15 },

  lightContainer: { backgroundColor: "#F2F2F7" },
  lightInputGroup: { backgroundColor: "#FFFFFF" },
  lightText: { color: "#000000" },
  lightInput: { color: "#000000" },
  lightSeparator: { backgroundColor: "#C6C6C8" },

  darkContainer: { backgroundColor: "#000000" },
  darkInputGroup: { backgroundColor: "#1C1C1E" },
  darkText: { color: "#FFFFFF" },
  darkInput: { color: "#FFFFFF" },
  darkSeparator: { backgroundColor: "#38383A" },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dims the background
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertBox: {
    width: 270, // Standard iOS Alert width
    backgroundColor: '#1E1E1E' ,
    borderRadius: 14,
    paddingTop: 20,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 5,
    color: 'white' ,
  },
  alertMessage: {
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    color: '#8E8E93',
  },
  button: {
    width: '100%',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#C6C6C8',
    paddingVertical: 12,
  },
  alertButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  modal: {
    borderWidth: 2,
    borderColor:"white",
    position:"absolute",
    backgroundColor:"white"
  }
});
