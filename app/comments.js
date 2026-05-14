import { Ionicons } from '@expo/vector-icons';
import md5 from 'md5';
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import Alert from "./alert";

import { get, getDatabase, onValue, ref, remove, update } from "firebase/database";
export default function Comments() {
  const post = useSelector((state) => state.post.postObject?.payload);
  const user = useSelector((state) => state.user.userDetails?.payload);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");


  const db = getDatabase();


  const [message, setMessage] = useState("");
  const [header, setHeader] = useState("");
  const [showModal, setShowModal] = useState(false);


  function syncCommentsInBackground() {
    const subscribe = onValue(ref(db, `users/${user?.username}/posts/${post?.post_id}/post_comments`), (snap) => {
      if (snap.exists()) {
        const val = snap.val();
        setComments(Object.values(val || {}));
      }
    });
    return subscribe;
  }

  useEffect(() => {
    setComments(Object.values(post?.post_comments || {}));
    const unsubscribe = syncCommentsInBackground();

    setLoading(false);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Loading..</Text>
      </SafeAreaView>
    );
  }


  const handleComment = () => {
    if (text.length === 0) return;
    const comment_id = md5(text) + Math.floor(Math.random() * 10000);

    const commenterPayload = {
      post_comment_writer: user?.username,
      post_comment: text,
      post_comment_id: comment_id,
    };

    update(ref(db, `users/${post?.post_owner}/posts/${post?.post_id}/post_comments/${comment_id}`), commenterPayload)
      .then(() => {
        setShowModal(true);
        setHeader("Hurray!")
        setMessage("Your comment has been posted")
      })
      .catch(() => {
        setShowModal(true);
        setHeader("Oops!!")
        setMessage("Error posting your comment, please try again later")
      });
  };



  const handleDeleteComment = (commentId) => {
    const commentRef = `users/${post?.post_owner}/posts/${post?.post_id}/post_comments/`;
    get(ref(db, commentRef)).then((snap) => {
      if (snap.exists()) {
        const obj = snap.val();
        if (Object.keys(obj).length > 1) {
          remove(ref(db, commentRef + commentId)).then(() => {
            setHeader("Deleted");
            setMessage("Comment has been deleted");
            setShowModal(true);
          });
        } else {
          set(ref(db, commentRef), JSON.stringify({}));
        }
      }
    });
  };


  return (
    <KeyboardAvoidingView style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}>
      <Alert message={message} setShowModal={setShowModal} showModal={showModal} header={header} />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scroll}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
      >
        {comments.map((comment, index) => (
          <View key={index} style={styles.commentRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {comment?.post_comment_writer?.charAt(0)?.toUpperCase()}
              </Text>
            </View>

            <View style={styles.bubble}>
              <View style={styles.commentHeader}>
                <Text style={styles.username}>
                  {comment.post_comment_writer}
                </Text>
                {comment.post_comment_writer === user.username &&
                  <TouchableOpacity onPress={() => { handleDeleteComment(comment.post_comment_id) }} style={styles.deleteBtn}>
                    <Ionicons name="trash-outline" size={18} color="#ff4d4d" />
                  </TouchableOpacity>}
              </View>

              <Text style={styles.commentText}>
                {comment.post_comment}
              </Text>
            </View>
          </View>
        ))}
      </KeyboardAwareScrollView>

      <View style={styles.inputBar}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Add a comment.."
          placeholderTextColor="#888"
          style={styles.input}
        />

        <TouchableOpacity onPress={handleComment}>
          <Text style={styles.postBtn}>Post</Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    paddingTop: 20
  },

  loading: {
    color: "white",
    textAlign: "center",
    marginTop: 20,
  },

  scroll: {
    padding: 15,
    paddingBottom: 80,
  },

  commentRow: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
  },

  avatar: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: "#333",
    marginRight: 10,
  },

  bubble: {
    backgroundColor: "#121212",
    padding: 10,
    borderRadius: 12,
    maxWidth: "85%",
  },

  username: {
    color: "white",
    fontWeight: "600",
    marginBottom: 3,
  },

  commentText: {
    color: "#ccc",
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#222",
    padding: 10,
    backgroundColor: "#000",
  },

  input: {
    flex: 1,
    color: "white",
    padding: 10,
    backgroundColor: "#111",
    borderRadius: 20,
    marginRight: 10,
  },

  postBtn: {
    color: "#0095f6",
    fontWeight: "600",
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
    paddingHorizontal: 12,
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  avatarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  bubble: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  username: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  commentText: {
    color: "#d6d6d6",
    fontSize: 14,
    lineHeight: 20,
  },

  deleteBtn: {
    padding: 4,
  },
});