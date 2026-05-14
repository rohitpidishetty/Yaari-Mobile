import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getDatabase, ref, update } from 'firebase/database';
import md5 from "md5";
import { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";

import axios from "axios";
import Alert from "./alert";
export default function UploadImage() {
  const { photo } = useLocalSearchParams();
  const router = useRouter();
  const db = getDatabase();

  const [locationName, setLocationName] = useState("");
  const [description, setDescription] = useState("");

  const route = useRouter();


  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let loc = await Location.getCurrentPositionAsync({});
      let geo = await Location.reverseGeocodeAsync(loc.coords);

      if (geo.length > 0) {
        const place = geo[0];
        setLocationName(
          `${place.city || place.district || "Unknown"}, ${place.region || ""}`
        );
      }
    })();
  }, []);



  async function uploadToS3(fileUri) {
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const fileName = fileUri.split("/").pop();

    const { data } = await axios.get(
      `https://yaari.vercel.app/generate_presigned_url/?filename=${fileName}&content_type=image/jpeg`
    );

    const uploadUrl = data.uploadUrl;
    const publicUrl = data.publicUrl;

    await fetch(uploadUrl, {
      method: "PUT",
      body: blob,
      headers: {
        "Content-Type": "image/jpeg",
      },
    });

    return publicUrl;
  }


  const sessionUser = useSelector((state) => state.user.userDetails.payload);

  const handleShare = async () => {

    try {

      const url = await uploadToS3(photo);


      const hash = md5(photo);
      const date = new Date();
      const currentCollection = ref(db, `users/${sessionUser?.username}/posts/${hash}`);
      await update(currentCollection, {
        post_id: hash,
        post_time_of_upload: date.getTime(),
        post_year_of_upload: date.getFullYear(),
        post_date_of_upload: date.getDate(),
        post_day_of_upload: date.getDay(),
        post_month_of_upload: date.getMonth(),
        post_location: locationName.toString(),
        post_description: description.toString(),
        post_likes: JSON.stringify({}),
        post_comments: JSON.stringify({}),
        post_link: url,
        post_owner: sessionUser?.username,
      }).then(() => {
        setHeader("Hurray!!")
        setMessage("Your post has been uploaded successfully");
        setShowModal(true);
        setTimeout(() => {
          route.push("/");
        }, 10)
      });
    } catch (err) {
      console.error(err);
      setHeader("Oops!!")
      setMessage("There was an issue uploading your post, please try again.");
      setShowModal(true);
    }
  };

  const [message, setMessage] = useState("");
  const [header, setHeader] = useState("");
  const [showModal, setShowModal] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <Alert message={message} setShowModal={setShowModal} showModal={showModal} header={header} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>

          <Text style={styles.title}>New Post</Text>

          <TouchableOpacity />

        </View>

        <Image source={{ uri: photo }} style={styles.image} />

        <View style={styles.form}>

          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color="#1E88E5" />
            <Text style={styles.text}>
              {locationName || "Getting location..."}
            </Text>
          </View>


          <View style={styles.caption}>
            <Ionicons name="create-outline" size={20} color="#888" />

            <TextInput
              placeholder="Write a description.."
              placeholderTextColor="#888"
              value={description}
              onChangeText={setDescription}
              style={styles.input}
              multiline
            />
          </View>

        </View>

        <TouchableOpacity style={styles.fab} onPress={handleShare}>
          <Ionicons name="arrow-up" size={22} color="white" />
        </TouchableOpacity>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: "center",
  },

  title: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  image: {
    width: "100%",
    height: 360,
  },

  form: {
    padding: 15,
    gap: 15,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  text: {
    color: "white",
    fontSize: 14,
  },

  caption: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "#121212",
    padding: 12,
    borderRadius: 12,
  },

  input: {
    flex: 1,
    color: "white",
    fontSize: 14,
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#1E88E5",
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});