import axios from "axios";
import { get, getDatabase, onValue, ref, remove, set, update } from "firebase/database";
import React, { useEffect, useState } from "react";
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";



import Feather from "react-native-vector-icons/Feather";
import Icon from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import Alert from "./alert";
import Footer from "./footer";

function NotificationAppActivity() {

  const db = getDatabase();

  const sessionUser = useSelector((state) => state.user.userDetails.payload);

  const [notifications, setNotifications] = useState([]);


  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [header, setHeader] = useState("");



  useEffect(() => {

    const userRef = ref(db, `users/${sessionUser.username}`);

    const unsubscribe = onValue(userRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // setSessionUser(data);

        if (data?.notifications && typeof data.notifications !== "string") {
          setNotifications(Object.values(data.notifications));
        } else {
          setNotifications([]);
        }
      }
    });

    update(ref(db, `users/${sessionUser.username}`), {
      new_notifications_count: 0,
    });

    return () => unsubscribe();
  }, []);

  const approveRequest = async (notify) => {
    setHeader("Growing your network!")
    setMessage("Approving..");
    setShowModal(true);

    try {
      const res = await axios.post(
        "https://yaari.vercel.app/assoc/",
        {
          union: {
            friend: {
              name: sessionUser?.username,
              dp: sessionUser?.profile_picture,
              req_id: notify.req_id,
            },
            with: {
              name: notify.from,
              dp: notify.profile_picture,
              deviceId: notify.deviceId,
            },
          },
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (res.data === 200) {
        setHeader("Growing your network!")
        setMessage("Approved");
        setShowModal(true);
      }
    } catch (err) {
      setHeader("Oops!!")
      setMessage("Approval failed");
      setShowModal(true);

    }
  };

  const rejectRequest = async (notify) => {
    const dRef = `users/${sessionUser.username}/notifications/`;

    const snap = await get(ref(db, dRef));

    if (snap.exists()) {
      const payload = snap.val();
      const notifications = Object.values(payload);

      if (notifications.length > 1) {
        remove(ref(db, `${dRef}/${notify.req_id}`));
      } else {
        set(ref(db, dRef), {});
      }
    }
  };


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Alert message={message} setShowModal={setShowModal} showModal={showModal} header={header} />
      <View style={styles.userRow}>
        <Image source={{ uri: item.profile_picture }} style={styles.dp} />
        <Text
          style={styles.username}
          onPress={() =>
            navigation.navigate("Profile", { q: item.from })
          }
        >
          {item.from}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btn, styles.green]}
          onPress={() => approveRequest(item)}
        >
          <Feather name="check" size={22} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btn, styles.red]}
          onPress={() => rejectRequest(item)}
        >
          <MaterialIcons name="cancel" size={22} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );


  return (
    <SafeAreaView style={[styles.container]}>
      <Footer />
      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="notifications-off-outline" size={60} color="gray" />
          <Text style={styles.emptyText}>You have no new notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      )}
    </SafeAreaView>
  );
}

export default NotificationAppActivity;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyText: {
    color: "#9a9aa1",
    marginTop: 12,
    fontSize: 14,
    letterSpacing: 0.3,
  },

  card: {
    backgroundColor: "#141420", // Instagram dark card feel
    marginHorizontal: 14,
    marginVertical: 8,
    padding: 14,
    borderRadius: 18,

    // Apple-like soft shadow
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  dp: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 10,

    borderWidth: 2,
    borderColor: "#2a2a35", // subtle IG ring style
  },

  username: {
    color: "#f2f2f7", // Apple white
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
    gap: 10,
  },

  btn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",

    // glassy feel
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },

  green: {
    backgroundColor: "rgba(52,199,89,0.18)", // Apple green tint
  },

  red: {
    backgroundColor: "rgba(255,59,48,0.18)", // Apple red tint
  },
});