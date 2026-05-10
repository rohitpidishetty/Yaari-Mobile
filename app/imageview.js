import { useRouter } from "expo-router";
import { get, getDatabase, onValue, ref, remove, set, update } from "firebase/database";
import md5 from "md5";
import { Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useSelector } from "react-redux";
import Alert from "./alert";

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import { styles as style } from "./Styles/StyleSheet";
export default function ImageView() {
  const post = useSelector((state) => state.post.postObject?.payload);
  const user = useSelector((state) => state.user.userDetails?.payload);
  const [count, setCount] = useState(() => Object.keys(post?.post_likes || {}).length);
  const [message, setMessage] = useState("");
  const [header, setHeader] = useState("");
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const db = getDatabase();


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
        FileSystem.cacheDirectory + `${payload.post_id}.jpg`;

      const downloaded = await FileSystem.downloadAsync(
        signedUrl,
        localPath
      );

      await Sharing.shareAsync(downloaded.uri, {
        mimeType: "image/jpeg",
        dialogTitle: "Yaari Image !!",
      });

    } catch (err) {
      setHeader("Oops")
      setMessage("Please try again later");
      setShowModal(true);
    }
  };

  function handleShare() {
    shareImage(post)
  }

  useEffect(() => {

    const unsubscribe = onValue(ref(db, `users/${post.post_owner}/posts/${post.post_id}/post_likes`), (snap) => {
      if (snap.exists()) {
        const likes = snap?.val();
        const hits = typeof likes === "string" ? [] : Object.keys(likes);
        setCount(hits.length);
      }
    });
    return () => unsubscribe();
  })

  function handleLike() {
    get(ref(db, `users/${post.post_owner}/posts/${post.post_id}/post_likes`))
      .then((snap) => {
        if (snap.exists()) {
          const likes = snap?.val();
          const hits = typeof likes === "string" ? [] : Object.keys(likes);
          const hit_id = md5(user?.username);
          if (!hits.includes(hit_id)) {
            update(ref(db, `users/${post?.post_owner}/posts/${post?.post_id}/post_likes/${hit_id}`), {
              likedBy: user?.username,
              likedById: hit_id
            })


          }
          else {
            if (hits.length > 1)
              remove(ref(db, `users/${post?.post_owner}/posts/${post?.post_id}/post_likes/${hit_id}`))
            else
              set(ref(db, `users/${post?.post_owner}/posts/${post?.post_id}/post_likes/`), JSON.stringify({}))
          }
        }
      });

  }

  function getPostAge() {
    let post_age = Math.floor((Date.now() - post.post_time_of_upload) / 3600000);
    let age = post_age <= 48
      ? `${post_age} hours ago`
      : post_age <= 1440
        ? `${Math.floor(post_age / 24)} days ago`
        : `${post.post_date_of_upload}/${post.post_month_of_upload + 1}/${post.post_year_of_upload}`;
    return age.toString();
  }
  const [option, showOptions] = useState(false);
  function handleOptions() {
    showOptions(true);
    const refPath = `users/${user?.username}/posts/${post.post_id}`;
    get(ref(db, `users/${user?.username}/posts/`)).then(snap => {
      if (snap.exists()) {
        var posts = snap.val();
        posts = Object.keys(posts);
        if (posts.length > 1)
          remove(ref(db, refPath)).then(snap => { setHeader("Deleted"); setMessage("Post deleted successfully"); setShowModal(true); });
        else
          set(ref(db, `users/${user?.username}/posts`), JSON.stringify({})).then(snap => { setHeader("Oops!"); setMessage("Post deleted successfully"); setShowModal(true); });
      }
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <Alert message={message} setShowModal={setShowModal} showModal={showModal} header={header} />
      <Modal
        animationType="fade"
        transparent={true}
        visible={option}
        onRequestClose={() => showOptions(false)}
      >
        <Pressable style={style.overlay} onPress={() => showOptions(false)}>
          <View style={style.alertBox}>

            <TouchableOpacity
              style={style.button}
              onPress={() => {
                console.log("Delete");
                showOptions(false);
              }}
            >
              <Text style={[style.alertButtonText, { color: "red" }]}>
                Delete
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={style.button}
              onPress={() => showOptions(false)}
            >
              <Text style={style.alertButtonText}>Cancel</Text>
            </TouchableOpacity>

          </View>
        </Pressable>
      </Modal>
      <View style={styles.header}>
        <Text style={styles.username}>{post?.post_owner}</Text>
        <Pressable onPress={handleOptions}>

          <Ionicons name="ellipsis-horizontal" size={20} color="white" />
        </Pressable>
      </View>
      <Image
        source={{ uri: post?.post_link }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.actions}>
        <View style={styles.leftActions}>

          <Pressable onPress={handleLike} style={styles.icon}>
            <Ionicons name="heart-outline" size={20} color="white" />
          </Pressable>

          <Pressable onPress={() => { router.push("/comments") }} style={styles.icon}>
            <Ionicons name="chatbubble-outline" size={20} color="white" />
          </Pressable>

          <Pressable onPress={handleShare} style={styles.icon}>
            <Ionicons name="paper-plane-outline" size={20} color="white" />
          </Pressable>

        </View>


      </View>
      <Text style={styles.likes}>
        {count} likes
      </Text>
      <Text style={styles.caption}>
        <Text style={{ fontWeight: "bold" }}>
          {post?.post_owner}{" "}
        </Text>
        {post?.post_description}
      </Text>
      <Text style={styles.location}>
        {post?.post_location}
      </Text>
      <View>
        <Text style={styles.location}>
          {getPostAge()}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    alignItems: "center",
  },

  username: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },

  image: {
    width: "100%",
    height: 400,
  },

  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: "center",
  },

  leftActions: {
    flexDirection: "row",
  },

  icon: {
    marginRight: 15,
  },

  likes: {
    color: "white",
    fontWeight: "600",
    paddingHorizontal: 10,
  },

  caption: {
    color: "white",
    paddingHorizontal: 10,
    marginTop: 4,
  },

  location: {
    color: "gray",
    paddingHorizontal: 10,
    marginTop: 4,
    fontSize: 12,
  },
});