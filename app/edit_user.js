import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getDatabase, ref, update } from 'firebase/database';
import { useSelector } from "react-redux";
import Alert from "./alert";


export default function EdiUser() {
  const user = useSelector((state) => state.user.userDetails.payload);
  const [name, setName] = useState(() => user.username);
  const [email, setEmail] = useState(() => user.email);
  const [phone, setPhone] = useState(() => user.phone);
  const [portfolio, setPortfolio] = useState(() => user.portfolio);
  const [bio, setBio] = useState(() => user.bio_status);

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


  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [header, setHeader] = useState("");


  return (
    <SafeAreaView style={styles.container}>

      <Alert message={message} setShowModal={setShowModal} showModal={showModal} header={header} />
      <View style={styles.card}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Name"
          placeholderTextColor="#777"
          style={styles.input}
        />
        <TouchableOpacity onPress={() => updateUserData(name, "name")}>
          <Ionicons name="checkmark-circle" size={22} color="#4ade80" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email"
          placeholderTextColor="#777"
          style={styles.input}
        />
        <TouchableOpacity onPress={() => updateUserData(email, "email")}>
          <Ionicons name="checkmark-circle" size={22} color="#4ade80" />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone"
          keyboardType="number-pad"
          placeholderTextColor="#777"
          style={styles.input}
        />
        <TouchableOpacity onPress={() => updateUserData(phone, "number")}>
          <Ionicons name="checkmark-circle" size={22} color="#4ade80" />
        </TouchableOpacity>
      </View>


      <View style={styles.card}>
        <TextInput
          value={portfolio}
          onChangeText={setPortfolio}
          placeholder="Portfolio"
          placeholderTextColor="#777"
          style={styles.input}
        />
        <TouchableOpacity onPress={() => updateUserData(portfolio, "portfolio")}>
          <Ionicons name="checkmark-circle" size={22} color="#4ade80" />
        </TouchableOpacity>
      </View>


      <View style={[styles.card, styles.bioCard]}>
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Bio"
          placeholderTextColor="#777"
          multiline
          style={[styles.input, styles.bioInput]}
        />
        <TouchableOpacity onPress={() => updateUserData(bio, "bio-data")}>
          <Ionicons name="checkmark-circle" size={22} color="#4ade80" />
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121212",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },

  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    paddingVertical: 6,
  },

  bioCard: {
    alignItems: "flex-start",
  },

  bioInput: {
    height: 80,
    textAlignVertical: "top",
  },
});