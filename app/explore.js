import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { useSelector } from "react-redux";

import TDS from "./TrieDataStructure";
import Validate from "./Validator";

import { getDatabase, onValue, ref } from "firebase/database";

export default function Explore() {

  const [searchUser, setSearchUser] = useState("");

  const trieObj = useRef(new TDS()).current;

  const validate = new Validate();

  const [yaariUsers, setYaariUsers] = useState({});

  const [listOfUsers, setFindUsers] = useState([]);

  const db = getDatabase();

  const sessionUser = useSelector(
    (state) => state.user?.userDetails?.payload
  );

  /* =========================
        FETCH USERS
  ========================= */

  useEffect(() => {

    const unsub = onValue(ref(db, "users/"), (snapshot) => {

      if (snapshot.exists()) {

        const collection = snapshot.val();

        setYaariUsers(collection);

        const users = Object.keys(collection);

        trieObj.clear?.();

        users.forEach((user) => {
          trieObj.fitTrie(
            trieObj.wordToTrieVec(user.toLowerCase())
          );
        });
      }
    });

    return () => unsub();

  }, []);

  /* =========================
        SEARCH
  ========================= */

  useEffect(() => {

    if (!searchUser.trim()) {
      setFindUsers([]);
      return;
    }

    const matchedUsers = trieObj.scanTrie(
      searchUser.toLowerCase()
    );

    const results = [];

    matchedUsers.forEach((username) => {

      if (yaariUsers[username]) {
        results.push(yaariUsers[username]);
      }

    });

    setFindUsers(results);

  }, [searchUser, yaariUsers]);

  return (
    <SafeAreaView style={styles.container}>

      {/* SEARCH BAR */}

      <View style={styles.searchContainer}>

        <TextInput
          placeholder="Enter friend's name"
          placeholderTextColor="#8E8E93"
          style={styles.input}
          value={searchUser}
          onChangeText={setSearchUser}
        />

        <Pressable style={styles.searchButton}>
          <Ionicons
            name="search-outline"
            size={22}
            color="#F5F5F7"
          />
        </Pressable>

      </View>

      {/* RESULTS */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginTop: 18 }}
      >

        {
          listOfUsers.map((user, idx) => {

            return (

              <TouchableOpacity
                key={idx}
                activeOpacity={0.85}
                style={styles.userCard}
              >

                <Image
                  source={{
                    uri: user?.profile_picture
                  }}
                  style={styles.dp}
                />

                <View style={styles.userInfo}>

                  <Text style={styles.name}>
                    {user?.name}
                  </Text>

                  <Text style={styles.username}>
                    @{user?.username}
                  </Text>

                  <Text
                    numberOfLines={2}
                    style={styles.bio}
                  >
                    {user?.bio_status}
                  </Text>

                </View>

              </TouchableOpacity>

            )

          })
        }

      </ScrollView>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#09090B",
    paddingTop: 20,
  },


  searchContainer: {

    flexDirection: "row",
    alignItems: "center",

    marginHorizontal: 16,

    backgroundColor: "#111114",

    borderRadius: 22,

    padding: 8,

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",

    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 6,
    },

    elevation: 10,
  },

  input: {
    flex: 1,

    height: 52,

    paddingHorizontal: 16,

    color: "#F5F5F7",

    fontSize: 15,
    fontWeight: "500",

    backgroundColor: "#1A1A22",

    borderRadius: 18,
  },

  searchButton: {

    width: 50,
    height: 50,

    marginLeft: 10,

    borderRadius: 16,

    justifyContent: "center",
    alignItems: "center",

    backgroundColor: "#1D1D27",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.04)",
  },



  userCard: {

    flexDirection: "row",
    alignItems: "center",

    marginHorizontal: 16,
    marginBottom: 14,

    padding: 14,

    borderRadius: 26,

    backgroundColor: "#111114",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",

    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 10,
  },

  dp: {

    width: 68,
    height: 68,

    borderRadius: 34,

    borderWidth: 2.5,
    borderColor: "#2B2B35",
  },

  userInfo: {
    flex: 1,
    marginLeft: 14,
  },

  name: {
    color: "#F5F5F7",

    fontSize: 16,
    fontWeight: "700",
  },

  username: {

    color: "#8E8E93",

    marginTop: 4,

    fontSize: 13.5,
  },

  bio: {

    color: "#D1D1D6",

    marginTop: 7,

    lineHeight: 18,

    fontSize: 13,
  },
});