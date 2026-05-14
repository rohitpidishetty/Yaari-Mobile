import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { styles } from "./Styles/StyleSheet";

export default function Alert({ message, setShowModal, showModal, header }) {
  return (
    <Modal
      style={styles.modal}
      animationType="fade"
      transparent={true}
      visible={showModal}
      onRequestClose={() => setShowModal(false)}
    >
      <Pressable style={styles.overlay} onPress={() => setShowModal(false)}>
        <View style={styles.alertBox}>
          <Text style={styles.alertTitle}>{header}</Text>
          <Text style={styles.alertMessage}>{message}
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowModal(false)}
          >
            <Text style={styles.alertButtonText}>Ok</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}