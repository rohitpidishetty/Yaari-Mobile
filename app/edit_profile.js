import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import Alert from "./alert";

import { getDatabase, ref, update } from 'firebase/database';

export default function EditProfile() {
  const user = useSelector((state) => state.user.userDetails.payload);
  const [bg, setBg] = useState(() => user.background_picture);
  const [dp, setDp] = useState(() => user.profile_picture);



  const db = getDatabase();

  const currentCollection = ref(db, `users/${user?.username}/`);


  function reflect(payload) {
    update(currentCollection, payload).then(e => {
      setHeader("Hurray!!")
      setMessage("Data changed successfully");
      setShowModal(true);
    }).catch(() => {
      setHeader("Oops!!")
      setMessage("Unable to make changes currently, please try again later")
      setShowModal(true);
    })
  }



  function updateUserData(data, key) {
    switch (key) {
      case 'live_location':
        reflect({
          live_location: data
        })
        break;
      case 'bio-data':
        reflect({
          bio_status: data.trim()
        });
        break;
      case 'display-picture-link':
        reflect({
          profile_picture: data.trim()
        })
        break;
      case 'bg-picture-link':
        reflect({
          background_picture: data.trim()
        })
        break;
      case 'password':
        reflect({
          password: data.trim()
        })
        break;
      case 'number':
        reflect({
          phone: data.trim()
        })
        break;
      case 'name':
        reflect({
          name: data.trim()
        })
        break;
      case 'email':
        reflect({
          email: data.trim()
        })
        break;
      case 'portfolio':
        reflect({
          portfolio: data.trim()
        })
        break;
      case 'private_account':
        reflect({
          private_account: data
        })
        break;

    }
  }



  const uploadUserImage = async (uri, location) => {
    if (!uri) return;

    const filename = uri.split("/").pop();

    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    const formData = new FormData();

    formData.append("image", {
      uri: uri,
      name: filename,
      type,
    });

    formData.append("folder", "Yaari_Display_Pictures_Uploads");

    try {
      const res = await fetch(
        "https://yaari.vercel.app/yaari_image_upload/",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = await res.json();

      console.log(data);

      if (data.status === 200) {
        updateUserData(data.url, location);
      }
    } catch (err) {
      console.log("Upload error:", err);
    }
  };

  const pickImage = async (setImage, type) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImage(uri);
      uploadUserImage(uri, type);
    }
  };


  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [header, setHeader] = useState("");


  return (
    <SafeAreaView style={styles.container}>
      <Alert message={message} setShowModal={setShowModal} showModal={showModal} header={header} />
      <View style={styles.card}>
        <Image
          source={{ uri: bg || "https://via.placeholder.com/300x150" }}
          style={styles.bgImage}
        />

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => pickImage(setBg, "bg-picture-link")}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>Change Background</Text>
        </TouchableOpacity>
      </View>


      <View style={styles.card}>
        <View style={styles.dpWrap}>
          <Image
            source={{ uri: dp || "https://via.placeholder.com/100" }}
            style={styles.dp}
          />
        </View>

        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={() => pickImage(setDp, "display-picture-link")}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>Change Profile Photo</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
  },

  card: {
    backgroundColor: "#121212",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    alignItems: "center",
  },

  bgImage: {
    width: "100%",
    height: 160,
    borderRadius: 14,
    marginBottom: 12,
  },

  dpWrap: {
    marginVertical: 12,
  },

  dp: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: "#4369e6",
  },

  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f1f1f",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },

  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});