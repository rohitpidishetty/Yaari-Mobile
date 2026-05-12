import { mountComments } from "@/yaari_redux/commentsSlice";
import { Ionicons } from "@expo/vector-icons";
import * as Device from 'expo-device';
import * as FileSystem from "expo-file-system/legacy";
import * as Notifications from 'expo-notifications';
import { router as r, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { get, getDatabase, onValue, ref, remove, set, update } from "firebase/database";
import md5 from "md5";
import { useEffect, useState } from "react";
import { FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import "react-native-get-random-values";
import { SafeAreaView } from "react-native-safe-area-context";
import { useDispatch, useSelector } from "react-redux";
import Alert from "./alert";
import Footer from "./footer";
import { styles } from "./Styles/StyleSheet";

export default function Main() {







  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === "dark";
  const router = useRouter();

  const themeContainerStyle = isDarkMode
    ? styles.darkContainer
    : styles.lightContainer;
  const themeInputGroupStyle = isDarkMode
    ? styles.darkInputGroup
    : styles.lightInputGroup;
  const themeTextStyle = isDarkMode ? styles.darkText : styles.lightText;
  const themeInputStyle = isDarkMode ? styles.darkInput : styles.lightInput;

  const db = getDatabase();

  const [userImages, setUserImages] = useState({});
  const [device_Ids, setUserDeviceIds] = useState({});

  const [showPosts, setShowPosts] = useState([]);


  const [message, setMessage] = useState("");
  const [header, setHeader] = useState("");
  const [showModal, setShowModal] = useState(false);


  const sessionUser = useSelector((state) => state.user.userDetails.payload);
  const dispatch = useDispatch();
  const route = useRouter();



  useEffect(() => {
    const unsubscribe = onValue(ref(db, "users/"), (snapshot) => {
      if (!snapshot.exists()) return;
      if (!sessionUser?.username) return;

      let posts = [];
      let images = {};
      let deviceId = {};

      const userId = md5(sessionUser.username);
      const collec = snapshot.val();

      Object.values(collec).forEach((user) => {
        if (!user?.username) return;

        const yaariUserId = md5(user.username);

        const friends = Object.keys(user?.friends || {});
        const currentFriends = Object.keys(sessionUser?.friends || {});

        images[user.username] = user?.profile_picture;
        deviceId[user.username] = user?.notification_id?.token;

        if (
          friends.includes(userId) &&
          currentFriends.includes(yaariUserId)
        ) {
          Object.values(user?.posts || {}).forEach((post) => {
            if (typeof post !== "string")
              posts.push(post);
          });
        }
      });

      if (typeof sessionUser?.posts !== "string") {
        Object.values(sessionUser.posts || {})
          .forEach((post) => {
            if (typeof post !== "string") {
              posts.push(post);
            }
          });
      }

      posts.sort(
        (a, b) => b.post_time_of_upload - a.post_time_of_upload
      );

      setUserImages(images);
      setUserDeviceIds(deviceId);
      setShowPosts([...posts]);
    });

    return () => unsubscribe();
  }, [sessionUser?.username]);
  function ShowPost({ item }) {

    const shareImage = async (payload) => {
      try {
        setHeader("Sharing File")
        setMessage("Preparing to share");
        setShowModal(true);


        const res = await fetch(
          `https://yaari.vercel.app/get_signed_url/?url=${encodeURIComponent(
            payload.post_link
          )}`
        );

        const { signedUrl } = await res.json();

        const localPath =
          FileSystem.documentDirectory + `${payload.post_id}.jpg`;

        const downloaded = await FileSystem.downloadAsync(
          signedUrl,
          localPath
        );

        await Sharing.shareAsync(downloaded.uri, {
          mimeType: "image/jpeg",
          dialogTitle: "Yaari Image !!",
        });

      } catch (err) {
        console.log(err)
        setHeader("Oops")
        setMessage("Please try again later");
        setShowModal(true);
      }
    };

    function handleShare() {
      shareImage(item)
    }

    function handleComments() {


      const data = {
        ref: `users/${item.post_owner}/posts/${item.post_id}/post_comments`,
        comments: item.post_comments
      }

      dispatch(mountComments(data));
      route.push("/post_comments");

    }


    function handleLike() {
      get(ref(db, `users/${item.post_owner}/posts/${item.post_id}/post_likes`))
        .then((snap) => {
          if (snap.exists()) {
            const likes = snap?.val();
            const hits = typeof likes === "string" ? [] : Object.keys(likes);
            const hit_id = md5(sessionUser?.username);
            if (!hits.includes(hit_id)) {
              update(ref(db, `users/${item.post_owner}/posts/${item.post_id}/post_likes/${hit_id}`), {
                likedBy: sessionUser?.username,
                likedById: hit_id
              })

            }
            else {
              if (hits.length > 1)
                remove(ref(db, `users/${item?.post_owner}/posts/${item?.post_id}/post_likes/${hit_id}`))
              else
                set(ref(db, `users/${item?.post_owner}/posts/${item?.post_id}/post_likes/`), JSON.stringify({}))
            }
          }
        });
    }


    function openYaariProfile() {
      if (item.post_owner === sessionUser.username) { route.push("/user"); return; }

      r.push({
        pathname: "/yaari_user",
        params: {
          username: item.post_owner,
        },
      });
      return;
    }

    function getPostAge() {
      let post_age = Math.floor((Date.now() - item.post_time_of_upload) / 3600000);
      let age = post_age <= 48
        ? `${post_age} hours ago`
        : post_age <= 1440
          ? `${Math.floor(post_age / 24)} days ago`
          : `${item.post_date_of_upload}/${item.post_month_of_upload + 1}/${item.post_year_of_upload}`;
      return age.toString();
    }

    const likesCount = item?.post_likes
      ? Object.keys(item.post_likes).length
      : 0;

    const commentsCount =
      item?.post_comments &&
        typeof item.post_comments === "object"
        ? Object.keys(item.post_comments).length
        : 0;

    return (
      <View style={style.postContainer}>


        <View style={style.header}>
          <TouchableOpacity onPress={openYaariProfile}>
            <View style={style.headerLeft}>

              <Image
                style={style.dp}
                source={{
                  uri: userImages[item?.post_owner],
                }}
              />

              <View>
                <Text style={style.username}>
                  {item.post_owner}
                </Text>

                {
                  item?.post_location !== "" &&
                  <Text style={style.location}>
                    {item?.post_location}
                  </Text>
                }
              </View>

            </View>
          </TouchableOpacity>
        </View>
        <Image
          style={style.postImage}
          source={{ uri: item.post_link }}
          resizeMode="cover"
        />
        <View style={style.actionsContainer}>

          <View style={style.leftActions}>

            <TouchableOpacity onPress={handleLike} style={style.iconBtn}>
              <Ionicons
                name="heart-outline"
                size={20}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleComments} style={style.iconBtn}>
              <Ionicons
                name="chatbubble-outline"
                size={20}
                color="white"
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShare} style={style.iconBtn}>
              <Ionicons
                name="paper-plane-outline"
                size={20}
                color="white"
              />
            </TouchableOpacity>

          </View>

        </View>

        <Text style={style.likesText}>
          {likesCount} likes
        </Text>

        {
          item?.post_description !== "" &&
          <Text style={style.description}>

            <Text style={style.username}>
              {item.post_owner}{" "}
            </Text>

            {item?.post_description}

          </Text>
        }

        {
          commentsCount > 0 &&
          <TouchableOpacity onPress={handleComments}>
            <Text style={style.commentsText}>
              View all {commentsCount} comments
            </Text>
          </TouchableOpacity>
        }

        <Text style={style.dateText}>
          {getPostAge()}
        </Text>

      </View>
    );
  }



  try {
    (async function registerForPushNotificationsAsync() {
      let token;

      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(
          "messages",
          {
            name: "Messages",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lockscreenVisibility:
              Notifications.AndroidNotificationVisibility.PUBLIC,
          }
        );
      }

      if (Device.isDevice) {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();

        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } =
            await Notifications.requestPermissionsAsync();

          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          setHeader("Notifications");
          setMessage('Permission not granted!');
          setShowModal(true);
          return;
        }

        token = (
          await Notifications.getDevicePushTokenAsync()
        ).data;

        // console.log(token)


        update(ref(db, `users/${sessionUser.username}/notification_id`), {
          token: token
        }).then(() => {

        }).catch(() => {
          setHeader("Oops!!");
          setMessage('Notifications can not be sent to this device');
          setShowModal(true);
        })

      } else {
        setHeader("Notifications");
        setMessage('Must use physical device');
        setShowModal(true);
      }

      return token;
    })();

    useEffect(() => {

      const receivedListener =
        Notifications.addNotificationReceivedListener(
          notification => {
            console.log(
              "Notification Received:",
              notification
            );
          }
        );


      const responseListener =
        Notifications.addNotificationResponseReceivedListener(
          response => {

            const data =
              response.notification.request.content.data;

            console.log("Notification Clicked:", data);

            if (data?.chatId) {
              router.push({
                pathname: "/chat_room",
                params: {
                  id: data.chatId
                }
              });
            }
          }
        );

      return () => {
        receivedListener.remove();
        responseListener.remove();
      };

    }, []);
  } catch (err) {
    console.log(err)
  }

  return (
    <SafeAreaView style={[styles.container, themeContainerStyle]}>
      <Footer />
      <Alert message={message} setShowModal={setShowModal} showModal={showModal} header={header} />

      <FlatList
        data={showPosts}
        keyExtractor={(item) => item.post_id}
        renderItem={({ item }) => <ShowPost item={item} />}
        extraData={showPosts}
      >
      </FlatList>

    </SafeAreaView>
  )
}

const style = StyleSheet.create({

  postContainer: {
    backgroundColor: "rgba(28,28,30,0.72)",
    marginBottom: 20,
    marginHorizontal: 5,
    borderRadius: 20,
    overflow: "hidden",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.35,
    shadowRadius: 24,

    elevation: 12,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 10,
    paddingVertical: 10,

    backgroundColor: "rgba(255,255,255,0.03)",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  dp: {
    width: 35,
    height: 35,
    borderRadius: 100,

    marginRight: 5,

    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.14)",
  },

  username: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  location: {
    color: "rgba(235,235,245,0.6)",
    fontSize: 11,
    marginTop: 3,
    fontWeight: "500",
  },

  postImage: {
    width: "100%",
    height: 400,

    backgroundColor: "#111",

    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 10,
    paddingTop: 10,
  },

  leftActions: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBtn: {
    width: 35,
    height: 35,

    borderRadius: 100,

    justifyContent: "center",
    alignItems: "center",

    marginRight: 10,

    backgroundColor: "rgba(255,255,255,0.06)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  likesText: {
    color: "#FFFFFF",

    fontWeight: "700",
    fontSize: 14,

    paddingHorizontal: 18,
    marginTop: 14,

    letterSpacing: 0.2,
  },

  description: {
    color: "rgba(255,255,255,0.92)",

    fontSize: 14,
    lineHeight: 22,

    paddingHorizontal: 18,
    marginTop: 8,
  },

  commentsText: {
    color: "rgba(235,235,245,0.55)",

    fontSize: 14,

    paddingHorizontal: 18,
    marginTop: 9,
  },

  dateText: {
    color: "rgba(235,235,245,0.35)",

    fontSize: 10,


    paddingHorizontal: 18,
    paddingBottom: 5,
    marginTop: 5,

  },

});