import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import axios from "axios";
import * as Location from "expo-location";
import { router } from "expo-router";
import { getDatabase, onValue, ref, update } from "firebase/database";
import { useSelector } from "react-redux";

export default function Friends() {
  const sessionUser = useSelector((state) => state.user.userDetails.payload);

  const [nearby, setNearBy] = useState([]);
  const [activityTracker, setActivityTracker] = useState({});

  const db = getDatabase();

  useEffect(() => {
    let unsubscribe = null;
    let locationWatch = null;

    const start = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      locationWatch = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (position) => {
          const { latitude, longitude } = position.coords;

          if (sessionUser?.username) {
            await update(ref(db, `users/${sessionUser.username}/location`), {
              lat: sessionUser.live_location ? latitude : 0,
              lon: sessionUser.live_location ? longitude : 0,
            });
          }
        }
      );

      unsubscribe = onValue(ref(db, `users/`), (snap) => {
        if (!snap.exists()) return;

        const users = snap.val();

        if (typeof sessionUser?.friends !== "string") {
          const updatedTracker = {};

          for (const fIdx in sessionUser?.friends) {
            const friend = sessionUser.friends[fIdx];
            const name = friend.name;

            const activity = users[name]?.user_activity;

            if (activity !== undefined) {
              updatedTracker[name] = activity;
            }
          }

          setActivityTracker(updatedTracker);
        }
      });
    };

    start();

    return () => {
      if (unsubscribe) unsubscribe();
      if (locationWatch) locationWatch.remove();
    };
  }, [sessionUser?.friends, sessionUser?.username]);

  const [suggest, setSuggest] = useState(false);

  useEffect(() => {
    let interval;

    const loadNearby = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const res = await axios.get(
        `https://yaari.vercel.app/yaari_suggestions/?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`
      );

      setNearBy(Object.values(res.data?.suggestion) || []);
    };

    loadNearby();

    interval = setInterval(loadNearby, 15000);

    return () => clearInterval(interval);
  }, []);
  const friends =
    typeof sessionUser?.friends !== "string"
      ? Object.values(sessionUser?.friends || {})
      : [];

  return (
    <FlatList
      style={styles.container}
      data={friends}

      keyExtractor={(item, i) => i.toString()}
      ListHeaderComponent={
        <>
          <Text style={styles.heading}>People Nearby</Text>

          <FlatList
            horizontal
            data={nearby}
            extraData={nearby}
            keyExtractor={(item, i) => i.toString()
            }
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              if (item.username === sessionUser?.username) return null;

              return (
                <TouchableOpacity onPress={() => {
                  router.push({
                    pathname: "/yaari_user",
                    params: {
                      username: item.username,
                    },
                  });
                }} style={styles.nearbyCard}>
                  <Image
                    source={{ uri: item.profile_picture }}
                    style={styles.nearbyDp}
                  />
                  <Text style={styles.nearbyName}>
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />

          <Text style={styles.heading}>Friends</Text>
        </>
      }
      renderItem={({ item }) => {
        const isActive =
          Date.now() - activityTracker[item?.name] <= 3000000;

        return (
          <TouchableOpacity onPress={() => {
            router.push({
              pathname: "/yaari_user",
              params: {
                username: item.name,
              },
            });
          }} style={styles.friendRow}>
            <View style={styles.avatarWrap}>
              <Image source={{ uri: item.dp }} style={styles.avatar} />
              {isActive && <View style={styles.activeDot} />}
            </View>

            <View style={styles.friendInfo}>
              <Text style={styles.friendName}>{item.name}</Text>
              <Text style={styles.subText}>
                {isActive ? "Active now" : "Offline"}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingHorizontal: 12,
  },

  heading: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginTop: 18,
  },

  nearbyCard: {
    width: 90,
    marginRight: 12,
    alignItems: "center",
  },

  nearbyDp: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: "#579ff1",
  },

  nearbyName: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 6,
  },

  addBtn: {
    marginTop: 5,
    backgroundColor: "#262626",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },

  addText: {
    color: "#fff",
    fontSize: 11,
  },


  friendRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 0.2,
    borderBottomColor: "#222",
  },

  avatarWrap: {
    position: "relative",
    marginRight: 12,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00ff6a",
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#000",
  },

  friendInfo: {
    flex: 1,
  },

  friendName: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  subText: {
    color: "#888",
    fontSize: 12,
    marginTop: 2,
  },
});