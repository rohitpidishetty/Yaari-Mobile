import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import { Link, useRouter } from "expo-router";
import { getDatabase, onValue, ref } from "firebase/database";
import { lazy, Suspense, useEffect, useState } from "react";
import { Image, Modal, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import Footer from "./footer";
import { styles } from "./Styles/StyleSheet";



const LazyComp = lazy(() => import("./lazyLoadSessionUsersPosts"));

export default function User() {


  const db = getDatabase();

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();
  const user = useSelector((state) => state.user.userDetails);



  const [bg, setBg] = useState("");
  const [bio, setBio] = useState("");
  const [dp, setDp] = useState("");
  const [userPayload, setUserPayload] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (!user?.payload?.username) return;
    const user_ref = ref(db, `users/${user.payload.username}`);
    const unsubscribe = onValue(
      user_ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.val();
          setBg(data?.background_picture);
          setBio(data?.bio_status);
          setDp(data?.profile_picture);
          setUserPayload(data);
          setLoading(false);
        }
      },
      { onlyOnce: true }
    );
    return () => unsubscribe();
  }, []);


  const [editModal, showEditModal] = useState(false);

  const [optionShow, setOptionsShow] = useState(false);


  const dispatch = useDispatch();




  const themeContainerStyle = isDarkMode
    ? styles.darkContainer
    : styles.lightContainer;
  const themeInputGroupStyle = isDarkMode
    ? styles.darkInputGroup
    : styles.lightInputGroup;
  const themeTextStyle = isDarkMode ? styles.darkText : styles.lightText;
  const themeInputStyle = isDarkMode ? styles.darkInput : styles.lightInput;

  if (loading) return (<SafeAreaView style={[styles.container, themeContainerStyle]}><Text>Loading..</Text></SafeAreaView>)

  return (
    <SafeAreaView style={[styles.container, themeContainerStyle]}>
      <Footer />

      {/* Edit Modal */}

      <Modal transparent visible={editModal} animationType="fade">
        <Pressable
          style={styles.optOverlay}
          onPress={() => showEditModal(true)}
        >
          <View style={styles.sheet}>

            <Pressable onPress={() => router.push("/edit_user")} style={styles.row}>
              <Ionicons name="person-outline" size={22} color="#fff" />
              <Text style={styles.text}>User</Text>
            </Pressable>

            <Pressable onPress={() => router.push("/edit_profile")} style={styles.row}>
              <Ionicons name="person-circle-outline" size={22} color="#fff" />
              <Text style={styles.text}>Profile</Text>
            </Pressable>

            <Pressable onPress={() => router.push("/edit_security")} style={styles.row}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#fff" />
              <Text style={styles.text}>Security</Text>
            </Pressable>



            <Pressable onPress={() => showEditModal(false)} style={styles.row}>
              <Ionicons name="close-outline" size={22} color="#fff" />
              <Text style={styles.text}>Close</Text>
            </Pressable>

          </View>
        </Pressable>
      </Modal>


      {/* Edit Modal */}


      {/* Options Modal */}

      <Modal transparent visible={optionShow} animationType="fade">
        <Pressable
          style={styles.optOverlay}
          onPress={() => setOptionsShow(true)}
        >
          <View style={styles.sheet}>

            <Pressable onPress={() => {

              const fileName = "user-log.txt";

              const path = FileSystem.documentDirectory + fileName;

              FileSystem.deleteAsync(path, { idempotent: true }).then(() => {
                router.push("/");
              }).catch((err) => alert("Clear cache"));
            }} style={styles.row}>
              <Ionicons name="log-out-outline" size={22} color="#fff" />
              <Text style={styles.text}>Logout</Text>
            </Pressable>

            <Pressable onPress={() => setOptionsShow(false)} style={styles.row}>
              <Ionicons name="close-outline" size={22} color="#fff" />
              <Text style={styles.text}>Close</Text>
            </Pressable>

          </View>
        </Pressable>
      </Modal>


      {/* Options Modal */}





      <View>
        <Image style={{ height: 200 }} source={{ uri: bg }} />
      </View>

      <View style={style.profileContainer}>
        <View style={style.leftComp}>
          <Image style={{ width: 70, height: 70, borderRadius: 50 }} source={{ uri: dp }} />
        </View>
        <View style={style.rightComp}>
          <View style={style.rightCompTopComp} >
            <View style={{ flex: 1 }}>
              <Pressable
                onPress={() => showEditModal(true)}
                style={{
                  backgroundColor: "#443A3A",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  Edit Profile
                </Text>
              </Pressable>
            </View>
            <Pressable onPress={() => {
              setOptionsShow(true);
            }} style={{ width: "10%", marginLeft: 10 }}>
              <Ionicons name="ellipsis-horizontal" size={18} color="white" />
            </Pressable>
          </View>
          <View style={{

            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
            alignItems: "center",
            padding: 5,
            paddingTop: 10,
            paddingBottom: 10
          }} >
            <Text style={{ color: "white" }}>{user.payload?.username.toString()}</Text>

            <Pressable>
              <Text style={{ color: "white" }}>Posts {Object.keys(user?.payload?.posts)?.length.toString()}</Text>
            </Pressable>

            <Pressable onPress={() => router.push("/friends")}>
              <Text style={{ color: "white" }}>Friends {Object.keys(user?.payload?.friends)?.length.toString()}</Text>
            </Pressable>
          </View>
          <View>
            <Text style={{ color: "white" }}>{bio.toString()}</Text>
            <Link style={{ color: "#1E88E5" }} href={userPayload?.portfolio}>{userPayload?.portfolio.toString()}</Link>
          </View>
        </View>
      </View>


      <Suspense fallback="Loading Posts..">
        <LazyComp posts={Object.values(userPayload?.posts)} />
      </Suspense>

    </SafeAreaView>
  )
}


const style = StyleSheet.create({
  profileContainer: {
    padding: 5,
    display: "flex",
    flexDirection: "row"
  },
  leftComp: {

    width: "20%"
  },
  rightComp: {

    width: "80%"
  },
  rightCompTopComp: {

    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  }
})