import axios from "axios";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { getDatabase, onValue, ref, update } from "firebase/database";
import md5 from "md5";
import { lazy, Suspense, useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import Alert from "./alert";
import Footer from "./footer";
import { styles } from "./Styles/StyleSheet";


const LazyComp = lazy(() => import("./lazyLoadSessionUsersPosts"));

export default function YaariUser() {

  const { username, profile, id } = useLocalSearchParams();


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
  const [connected, setConnection] = useState(false);
  const [postCount, setPostCount] = useState(0);




  useEffect(() => {


    const user_ref = ref(db, `users/${username}`);
    const unsubscribe = onValue(
      user_ref,
      (snap) => {
        if (snap.exists()) {
          const data = snap.val();
          const n = Object.keys(data.posts).length;
          setPostCount(data.posts.toString() === "{}" ? 0 : n);
          setBg(data?.background_picture);
          setBio(data?.bio_status);
          setDp(data?.profile_picture);
          setConnection(Object.keys(data?.friends).includes(md5(user.payload.username).toString()))
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





  const sendFriendRequest = () => {

    axios.post(
      "https://yaari.vercel.app/assoc_req/",
      {
        from: {
          name: user?.payload?.username,
          deviceId: user?.payload?.notification_id?.token,
          dp: user?.payload?.profile_picture
        },
        to: {
          name: username,
          deviceId: userPayload?.notification_id?.token,
          dp: userPayload?.profile_picture
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    ).then(res => {
      setHeader("Hurray !! Growing Network")
      setMessage("Sent Request");
      setShowModal(true);
    }).catch(err => {
      console.error("Error sending request:", err);
    });
  };


  const removeFriend = () => {
    axios.post(
      "https://yaari.vercel.app/de_assoc/",
      {
        from: {
          name: user?.payload?.username,
        },
        to: {
          name: username,
        }
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    ).then(res => {
      setHeader("Hope you find a good Yaari")
      setMessage("Removed user as Yaari");
      setShowModal(true);

    }).catch(err => {
      console.error("Error sending request:", err);
    });
  };

  function handleConnection() {
    if (connected)
      removeFriend();
    else
      sendFriendRequest();
  }


  function messageUser() {

    const altChatBufferId1 = md5(user.payload?.username + username);
    const altChatBufferId2 = md5(username + user.payload?.username);
    const chatBufferId = altChatBufferId1 < altChatBufferId2 ? altChatBufferId1 : altChatBufferId2;

    update(ref(db, `convos/${chatBufferId}`), {
      this: {
        name: user.payload.username,
        dp: user.payload.profile_picture,
        deviceId: user.payload.notification_id?.token
      },
      to: {
        name: username,
        dp: profile,
        deviceId: id
      },
      chatId: chatBufferId,
      chat: JSON.stringify({})
    }).then((snap) => {
      axios.post("https://yaari.vercel.app/assoc_chat_id/",
        {
          convInitiator1: user?.payload.username,
          convInitiator2: username,
          chatId: chatBufferId
        },
        {
          headers: { "Content-Type": "application/json" }
        }).then(res => {
          // setShowLoading(false);

          if (res.data.status == 200) {
            router.push({
              pathname: "/chat_room",
              params: {
                id: chatBufferId
              }
            })

          }
        })
    }).catch(e => {
      // setShowLoading(false);
    })
  }

  const [message, setMessage] = useState("");
  const [header, setHeader] = useState("");
  const [showModal, setShowModal] = useState(false);


  if (loading) return (<SafeAreaView style={[styles.container, themeContainerStyle]}><Text>Loading..</Text></SafeAreaView>)


  return (
    <SafeAreaView style={[styles.container, themeContainerStyle]}>
      <Footer />
      <Alert message={message} setShowModal={setShowModal} showModal={showModal} header={header} />





      <View>
        <Image style={{ height: 200 }} source={{ uri: bg }} />
      </View>

      <View style={style.profileContainer}>
        <View style={style.leftComp}>
          <Image style={{ width: 70, height: 70, borderRadius: 50 }} source={{ uri: dp }} />
        </View>
        <View style={style.rightComp}>
          <View style={style.rightCompTopComp} >
            <View style={{ flex: 1, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
              <TouchableOpacity
                onPress={() => handleConnection()}
                style={{
                  backgroundColor: "#443A3A",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  width: "45%"
                }}
              >
                <Text style={{ color: "white", textAlign: "center" }}>
                  {connected ? "Remove" : "Add Yaari"}
                </Text>

              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  messageUser()
                }}
                style={{
                  backgroundColor: "#443A3A",
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                  borderRadius: 8,
                  width: "45%"
                }}>

                <Text style={{ color: "white", textAlign: "center" }}>
                  Message
                </Text>
              </TouchableOpacity>
            </View>

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
            <Text style={{ color: "white" }}>{userPayload?.username.toString()}</Text>

            <Pressable>
              <Text style={{ color: "white" }}>Posts {postCount}</Text>
            </Pressable>

            <Pressable>
              <Text style={{ color: "white" }}>Friends {Object.keys(userPayload?.friends)?.length.toString()}</Text>
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