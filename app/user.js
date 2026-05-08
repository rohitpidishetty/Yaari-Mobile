import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { getDatabase, onValue, ref } from "firebase/database";
import { lazy, Suspense, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import Footer from "./footer";
import { styles } from "./Styles/StyleSheet";



const LazyComp = lazy(() => import("./lazyLoadSessionUsersPosts"));

export default function User() {


  const db = getDatabase();

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();
  const user = useSelector((state) => state.user.userDetails);


  console.log(Object.keys(user.payload.friends).length)

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
                style={{
                  backgroundColor: "gray",
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
            <Pressable style={{ width: "10%" }}>
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
            <Text style={{ color: "white" }}>{user.payload?.username}</Text>

            <Pressable>
              <Text style={{ color: "white" }}>Posts {Object.keys(user?.payload?.posts)?.length.toString()}</Text>
            </Pressable>

            <Pressable>
              <Text style={{ color: "white" }}>Friends {Object.keys(user?.payload?.friends)?.length.toString()}</Text>
            </Pressable>
          </View>
          <View>
            <Text style={{ color: "white" }}>{bio}</Text>
            <Link style={{ color: "#1E88E5" }} href={userPayload?.portfolio}>{userPayload?.portfolio}</Link>
          </View>
        </View>
      </View>


      <Suspense fallback="Loading Posts..">
        <LazyComp posts={Object.values(userPayload.posts)} />
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