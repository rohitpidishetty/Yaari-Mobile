import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);

  const [facing, setFacing] = useState("back");
  const [photo, setPhoto] = useState(null);
  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>
          Allow camera access to continue
        </Text>

        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={{ color: "white" }}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    const pic = await cameraRef.current?.takePictureAsync({
      quality: 0.8,
    });
    setPhoto(pic.uri);
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>

      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
      />

      {photo && (
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/upload_image",
              params: { photo: photo },
            })
          }
          style={styles.preview}
        >
          <Image source={{ uri: photo }} style={styles.previewImage} />
        </Pressable>
      )}





      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={pickFromGallery}>
          <Ionicons name="images-outline" size={30} color="white" />
        </TouchableOpacity>

        <TouchableOpacity onPress={takePicture} style={styles.captureBtn}>
          <View style={styles.captureInner} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            setFacing((p) => (p === "back" ? "front" : "back"))
          }
        >
          <Ionicons name="camera-reverse-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  topBar: {
    position: "absolute",
    top: 10,
    width: "100%",
    alignItems: "center",
    zIndex: 10,
  },

  logo: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  bottomBar: {
    position: "absolute",
    bottom: 30,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  captureBtn: {
    width: 75,
    height: 75,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },

  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 50,
    backgroundColor: "white",
  },

  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
  },

  permissionText: {
    color: "white",
    marginBottom: 20,
  },

  button: {
    padding: 12,
    backgroundColor: "#1E88E5",
    borderRadius: 8,
  },

  preview: {
    position: "absolute",
    bottom: 120,
    right: 20,
    width: 90,
    height: 140,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "white",
  },

  previewImage: {
    width: "100%",
    height: "100%",
  },
});