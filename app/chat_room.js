import { Feather, Ionicons } from "@expo/vector-icons";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { getDatabase, onValue, ref, update } from "firebase/database";
import md5 from "md5";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import RASecuredMessagingProtocol from "./RASMP";
export default function chat_room() {
  const { id } = useLocalSearchParams();
  const [convoPayload, setConvoPayload] = useState({});
  const protocol = new RASecuredMessagingProtocol();
  const db = getDatabase();
  const sessionUser = useSelector((state) => state.user.userDetails.payload);

  async function getImage(image) {
    if (!image || image?.name == null) return "";
    let formData = new FormData();
    formData.append("image", image);
    formData.append("folder", "YaariChatUploads");
    return axios.post(
      "https://yaari.vercel.app/yaari_image_upload/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    ).then(snap => {
      if (snap.data.status != 200) {
        alert(
          "Unable to upload image at this time, please try again later"
        );
        return "";
      }

      return snap.data.url;
    });
  }
  const dispatchMessage = async () => {
    if (userMessage.length == 0 && !image) return;
    var message_id = md5(sessionUser?.username + userMessage + new Date().getTime().toString() + Math.floor(Math.random() * 100000));
    const URL = await getImage(image);
    if (!protocol) return null;

    const encrypted = protocol.encrypt(userMessage);
    var payload = {
      author: sessionUser?.username,
      message: encrypted,
      uploads: URL,
      message_time_stamp: new Date().getTime(),
      message_id: message_id,
      seen: false
    }
    update(ref(db, `convos/${id}/chat/${message_id}`), payload).then(() => {
      setUserMessage("");
      setImage(null);
    }).then(snap => {
      axios.post("https://yaari.vercel.app/yaari_notify/",
        {
          deviceId: (convoPayload?.this?.name === sessionUser?.username) ? convoPayload?.to?.deviceId : convoPayload?.this?.deviceId,
          user_message: userMessage,
          author: sessionUser?.username
        },
        { headers: { "Content-Type": "application/json" } }).then((res) => {

        })
    })
  }



  const dispatchClickableMessage = async (payload) => {
    var message_id = md5(sessionUser?.username + payload + new Date().getTime().toString() + Math.floor(Math.random() * 100000));
    if (!protocol) return null;
    const encrypted = protocol.encrypt(payload);
    var payload = {
      author: sessionUser?.username,
      message: encrypted,
      uploads: null,
      message_time_stamp: new Date().getTime(),
      message_id: message_id,
      seen: false
    }
    update(ref(db, `convos/${id}/chat/${message_id}`), payload).then(() => {
      setUserMessage("");
    }).then(snap => {
      axios.post("https://yaari.vercel.app/yaari_notify/",
        {
          deviceId: (convoPayload?.this?.name === sessionUser?.username) ? convoPayload?.to?.deviceId : convoPayload?.this?.deviceId,
          user_message: "Ringing....",
          author: sessionUser?.username
        },
        { headers: { "Content-Type": "application/json" } }).then((res) => {
        })
    })
  }

  useEffect(() => {
    const unsubscribe = onValue(ref(db, `convos/${id}`), (snap) => {
      if (snap.exists()) {
        const collection = snap.val();
        Object.values(collection?.chat).forEach(chatPayload => {
          if (typeof chatPayload !== "string" && chatPayload?.author !== sessionUser.username)
            update(ref(db, `convos/${id}/chat/${chatPayload?.message_id}`), { seen: true });
        })
        setConvoPayload(collection);
      }
    })

    return () => unsubscribe();
  }, [id])



  const [userMessage, setUserMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState("");


  async function processChats(chats) {
    if (chats === undefined) return;
    const payload = Object.values(chats);
    const display = payload?.sort((a, b) => a.message_time_stamp - b.message_time_stamp);
    const decryptedPayload = await Promise.all(
      display.map(async (buffer) => {
        if (buffer?.message) {
          if (!protocol) return null;
          const decryptedMessage = protocol.decrypt(buffer.message);
          let message = new TextDecoder().decode(decryptedMessage);


          return { ...buffer, message: message };
        }
        return buffer;
      })
    );

    return decryptedPayload;
  }

  const [displayChats, setDisplayChats] = useState([]);

  const [image, setImage] = useState(null);

  const pickImage = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Permission required!");
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

    if (!result.canceled) {
      const asset = result.assets[0];

      const file = {
        uri: asset.uri,
        name: asset.fileName || `upload_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      };

      setImage(file);
    }
  };


  useEffect(() => {
    async function loadChats() {
      if (!convoPayload?.chat || Object.keys(convoPayload.chat).length == 0 || convoPayload.chat.toString() === "{}") return;
      const decrypted = await processChats(convoPayload.chat);
      setDisplayChats(decrypted);
    }
    loadChats();
  }, [convoPayload]);


  // console.log(displayChats)
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.header}>
        {convoPayload && (
          <>

            <TouchableOpacity
              style={styles.leftDiv}
              onPress={() => {
                router.push({
                  pathname: "/yaari_user",
                  params: {
                    username: (convoPayload.this?.name ===
                      sessionUser?.username
                      ? convoPayload.to?.name
                      : convoPayload.this?.name),
                  },
                });
              }
              }
            >
              <Image
                source={{
                  uri:
                    convoPayload.this?.dp ===
                      sessionUser?.profile_picture
                      ? convoPayload.to?.dp
                      : convoPayload.this?.dp,
                }}
                style={styles.avatar}
              />

              <Text style={styles.name}>
                {convoPayload.this?.name ===
                  sessionUser?.username
                  ? convoPayload.to?.name
                  : convoPayload.this?.name}
              </Text>
            </TouchableOpacity>
            {/* 
            <TouchableOpacity
              style={styles.callButton}
              onPress={() => {
                const cid = uuidv4();
                const payload = `_0xClickableCallActivity_0a1:https://yaari-jud.web.app/receiving-user?cid=${cid}&dp=${convoPayload.this?.dp === sessionUser?.profile_picture
                  ? convoPayload.this?.dp
                  : convoPayload.to?.dp}&name=${convoPayload.this?.name === sessionUser?.username
                    ? convoPayload.this?.name
                    : convoPayload.to?.name}`;


                dispatchClickableMessage(payload);

                router.push({
                  pathname: "/call",
                  params: {
                    q: (convoPayload.this?.name ===
                      sessionUser?.username
                      ? convoPayload.to?.name
                      : convoPayload.this?.name),
                    i: (convoPayload.this?.dp === sessionUser?.profile_picture
                      ? convoPayload.to?.dp
                      : convoPayload.this?.dp),
                    f: (convoPayload.this?.name === sessionUser?.username
                      ? convoPayload.this?.name
                      : convoPayload.to?.name),
                    cid: cid
                  }
                }
                );
              }}
            >

              <Ionicons name="call" size={22} color="#0A84FF" />
            </TouchableOpacity> */}
          </>
        )}
      </View>

      <ScrollView

        style={styles.chatArea}
        keyboardShouldPersistTaps="handled"
      >
        {/* ENCRYPTION INFO */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            Messages are end-to-end encrypted using RASM Protocol
          </Text>
        </View>

        {/* MESSAGES */}
        {Object.keys(displayChats).length != 0 && displayChats?.map((ch, index) => {
          const isMine =
            ch?.author === sessionUser?.username;

          const isCall =
            ch?.message?.startsWith(
              "_0xClickableCallActivity_0a1:"
            );

          const callUrl = isCall
            ? ch.message.replace(
              "_0xClickableCallActivity_0a1:",
              ""
            )
            : null;

          return (
            <View
              key={index}
              style={[
                styles.msgWrapper,
                {
                  alignItems: isMine
                    ? "flex-end"
                    : "flex-start",
                },
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  isMine
                    ? styles.rightBubble
                    : styles.leftBubble,
                ]}
              >



                {ch?.uploads && (
                  <Image
                    source={{ uri: ch.uploads }}
                    style={styles.image}
                  />
                )}


                {isCall ? (
                  <TouchableOpacity>
                    <Text style={styles.callText}>
                      Audio Call
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.msgText}>
                    {ch?.message}
                  </Text>
                )}

                <View style={styles.timeRow}>
                  <Text style={styles.time}>
                    {new Date(
                      ch?.message_time_stamp
                    ).getHours()}
                    :
                    {new Date(
                      ch?.message_time_stamp
                    )
                      .getMinutes()
                      .toString()
                      .padStart(2, "0")}
                  </Text>

                  {isMine && (
                    <Ionicons
                      name={
                        ch?.seen ? "eye" : "eye-off"
                      }
                      size={12}
                      color="#888"
                    />
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>


      <View style={styles.inputBar}>

        <TouchableOpacity onPress={pickImage}>
          <Feather
            name="upload"
            size={22}
            color="#aaa"
          />
        </TouchableOpacity>



        {image && (
          <Image
            source={{ uri: image.uri }}
            style={styles.preview}
          />
        )}


        <TextInput
          style={styles.input}
          placeholder="Type a message"
          placeholderTextColor="#777"
          value={userMessage}
          onChangeText={setUserMessage}
        />


        <TouchableOpacity onPress={dispatchMessage}>
          <Ionicons
            name="send"
            size={22}
            color="#0A84FF"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

}





const styles = StyleSheet.create({

  header: {
    height: 70,
    paddingHorizontal: 16,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#000",

    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },

  leftDiv: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 38,
    height: 38,
    borderRadius: 14,
    marginRight: 10,
  },

  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },

  callButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,

    backgroundColor: "#1C1C1E",
  },

  callText: {
    color: "#0A84FF",
    fontSize: 14,
    fontWeight: "600",
  },

  container: {
    flex: 1,
    backgroundColor: "#000",
  },

  chatArea: {
    flex: 1,
    paddingHorizontal: 12,
  },

  notice: {
    alignItems: "center",
    marginVertical: 10,
  },

  noticeText: {
    color: "#0A84FF",
    fontSize: 12,
    textAlign: "center",
    width: "80%",
  },

  msgWrapper: {
    marginBottom: 10,
  },

  bubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 20,
  },

  rightBubble: {
    backgroundColor: "#0A84FF",
    borderBottomRightRadius: 6,
  },

  leftBubble: {
    backgroundColor: "#1C1C1E",
    borderBottomLeftRadius: 6,
  },

  msgText: {
    color: "#fff",
    fontSize: 15,
  },

  callText: {
    color: "#0A84FF",
    fontWeight: "600",
  },

  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 6,
  },

  image: {
    width: 200,
    height: 220,
    borderRadius: 14,
    marginBottom: 8,
  },

  timeRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 6,
    gap: 6,
  },

  time: {
    fontSize: 10,
    color: "#aaa",
  },

  inputBar: {
    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 10,
    paddingVertical: 8,

    backgroundColor: "#0B0B0F",

    borderTopWidth: 0,

    // soft floating effect
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: -4,
    },

    elevation: 10,
  },

  input: {
    flex: 1,
    color: "#fff",

    backgroundColor: "#1C1C1E",

    borderRadius: 20,

    paddingHorizontal: 14,
    paddingVertical: 10,

    fontSize: 15,
  },

  preview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 8,
  },
  sendButton: {
    marginLeft: 20,

    width: 38,
    height: 38,
    borderRadius: 19,

    backgroundColor: "#0A84FF",

    alignItems: "center",
    justifyContent: "center",
  },
});