import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";

import {
  Image,
  ImageBackground,
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

import axios from "axios";
import * as Location from "expo-location";
import { router, useRouter } from "expo-router";

export default function Explore() {

  const [searchUser, setSearchUser] = useState("");

  const trieObj = useRef(new TDS()).current;

  const validate = new Validate();
  const route = useRouter();
  const [yaariUsers, setYaariUsers] = useState({});

  const [listOfUsers, setFindUsers] = useState([]);

  const db = getDatabase();

  const sessionUser = useSelector(
    (state) => state.user?.userDetails?.payload
  );


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


  const [suggestions, setSuggestions] = useState([]);
  const [spinner, setSpinner] = useState(true);
  const [coords, setCoords] = useState(null);


  useEffect(() => {

    (async () => {

      try {

        let { status } =
          await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          console.log("Location permission denied");
          setSpinner(false);
          return;
        }

        let location =
          await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

        const { latitude, longitude } =
          location.coords;

        const data = await axios.get(
          `https://geo-genius-psi.vercel.app/location/?lat=${latitude}&lon=${longitude}`
        );

        setCoords({
          lat: latitude,
          lon: longitude,
        });

        setSuggestions(data.data);
        setSpinner(false);

      } catch (e) {

        console.log("Geo error:", e);

      } finally {

        setSpinner(false);

      }

    })();

  }, []);

  return (
    <SafeAreaView style={styles.container}>



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



      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ marginTop: 18, height: 100 }}
      >

        {
          listOfUsers.map((user, idx) => {

            return (

              <TouchableOpacity
                key={idx}
                activeOpacity={0.85}
                style={styles.userCard}
                onPress={() => {
                  if (sessionUser.username === user.username) { route.push("/user"); return; }
                  router.push({
                    pathname: "/yaari_user",
                    params: {
                      username: user.username,
                    },
                  });
                }}
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




      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsContainer}
        style={{ flex: 2, backgroundColor: "#111114", borderRadius: 30, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)" }}
      >

        {
          spinner &&
          <View style={styles.loaderContainer}>

            <Text style={{
              color: "gray"
            }}>Fetching hotSpots near you..</Text>
          </View>
        }
        {suggestions?.suggest?.map((place, index) => {
          return (
            <ImageBackground
              key={index}
              source={{ uri: place.image_url }}
              style={styles.card2}
              imageStyle={{ borderRadius: 22 }}
            >

              <View style={styles.overlay} />

              <View style={styles.cardContent}>

                <Text style={styles.distance}>
                  {place.distance}
                </Text>

                <Text style={styles.title}>
                  {place.name}
                </Text>

                <Text style={styles.description}>
                  {place.description}
                </Text>

              </View>

            </ImageBackground>
          );
        })}

        {suggestions?.suggest?.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No popular spots detected in the vicinity
            </Text>
          </View>
        )}
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

  loaderContainer: {
    flex: 1,
    alignItems: "center",
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
  suggestionsContainer: {
    padding: 6,
    paddingBottom: 2,
  },


  card: {
    height: 180,

    borderRadius: 24,

    marginBottom: 16,

    overflow: "hidden",

    backgroundColor: "#141418",

    // Apple floating effect
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 10,
  },


  card2: {
    height: 100,

    borderRadius: 24,

    marginBottom: 16,

    overflow: "hidden",

    backgroundColor: "#141418",

    // Apple floating effect
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: {
      width: 0,
      height: 8,
    },

    elevation: 10,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,

    backgroundColor: "rgba(0,0,0,0.35)",
  },

  cardContent: {
    position: "absolute",

    bottom: 0,
    left: 16,
    right: 16,
  },

  distance: {
    color: "#D1D1D6",

    fontSize: 12,

    fontWeight: "600",

    marginBottom: 6,
  },

  title: {
    color: "#FFFFFF",

    fontSize: 20,
    fontWeight: "800",

    letterSpacing: 0.3,
  },

  description: {
    color: "#E5E5EA",

    marginTop: 6,

    fontSize: 13.5,

    lineHeight: 18,
  },



  emptyState: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    color: "#8E8E93",
    fontSize: 14,
    textAlign: "center",
  },
});