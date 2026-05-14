import { router } from "expo-router";
import { getDatabase, onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import RASecuredMessagingProtocol from "./RASMP";
import { Ionicons } from "@expo/vector-icons";

export default function MessagePool() {
  const user = useSelector((state) => state.user.userDetails.payload);
  const db = getDatabase();

  const [userChats, setUserChats] = useState({});
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (
      user?.messages &&
      typeof user.messages !== "string"
    ) {
      const chatIds = Object.keys(user?.messages);
      const chats = {};
      let fetchedCount = 0;
      chatIds.forEach((chatId) => {
        const chatRef = ref(db, `convos/${chatId}`);
        onValue(chatRef, (snap) => {
          if (snap.exists()) {
            chats[chatId] = snap.val();
            chats[chatId].recent_message = Object.values(chats[chatId].chat).sort((a, b) => b?.message_time_stamp - a?.message_time_stamp)[0];
            let unseen_messages = 0;
            Object.values(chats[chatId]?.chat).forEach(chat => {
              if (chat?.author != user?.username) {
                if (!chat?.seen)
                  unseen_messages++;
              }
            })
            chats[chatId].new_unseen_messages = unseen_messages;
          }
          fetchedCount++;
          if (fetchedCount === chatIds.length) {
            const order = (Object.values(chats).filter(e => typeof e.chat !== "string").sort((a, b) => b?.recent_message?.message_time_stamp - a?.recent_message?.message_time_stamp));
            // console.log(order)
            setUserChats(order);
            setShow(true);
          }
        }, { onlyOnce: true });
      });
    }
  }, []);


  const protocol = new RASecuredMessagingProtocol();

  return (<SafeAreaView style={styles.container}>
    <Text style={styles.heading}>Messages</Text>

    <View>
      {userChats?.length == 0 && (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={70} color="#999" />
          <Text style={styles.emptyText}>
            Looks like your inbox is enjoying a nap
          </Text>
        </View>
      )}

      {show &&
        userChats.map((chat, index) => {
          let recent = chat?.recent_message;

          let recentMessage = new TextDecoder().decode(
            protocol.decrypt(recent["message"])
          );

          if (
            recentMessage.startsWith("_0xClickableCallActivity_0a1")
          )
            recentMessage = "Audio Call";

          recent = `${recent["author"] == user.username
            ? "You"
            : recent["author"]
            } : ${recentMessage}`;

          return (
            <Pressable
              style={styles.chatCard}
              key={chat?.chatId || index}
              onPress={() => {
                router.push({
                  pathname: "/chat_room",
                  params: {
                    id: chat?.chatId
                  }
                })
              }
              }
            >
              <View style={styles.glossyOverlay} />

              <View>
                <Image
                  style={styles.avatar}
                  source={{
                    uri:
                      chat?.to?.dp === user?.profile_picture
                        ? chat?.this?.dp
                        : chat?.to?.dp,
                  }}
                />

                <View style={styles.activeDot} />
              </View>

              <View style={styles.chatInfo}>
                <Text style={styles.username}>
                  {chat?.to?.name === user?.username
                    ? chat?.this?.name
                    : chat?.to?.name}
                </Text>

                <Text
                  numberOfLines={1}
                  style={[
                    styles.recentMessage,
                    !chat?.recent_message?.seen &&
                    styles.unreadMessage,
                  ]}
                >
                  {(chat?.new_unseen_messages >= 0 &&
                    chat?.new_unseen_messages <= 2)
                    ? recent
                    : `${chat?.new_unseen_messages} new messages`}
                </Text>
              </View>

              {chat?.new_unseen_messages > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {chat?.new_unseen_messages}
                  </Text>
                </View>
              )}
            </Pressable>
          );
        })}
    </View>
  </SafeAreaView>);
}





const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B0F",
    paddingHorizontal: 14,
    paddingTop: 10,
  },

  heading: {
    color: "white",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    letterSpacing: 0.3,
  },

  emptyContainer: {
    marginTop: 100,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    color: "#8E8E93",
    fontSize: 16,
    fontWeight: "500",
  },

  // Chat card
  chatCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    marginBottom: 12,

    borderRadius: 28,

    backgroundColor: "rgba(255,255,255,0.08)",

    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",

    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 18,


    elevation: 10,

    backdropFilter: "blur(18px)",

    overflow: "hidden",
  },

  glossyOverlay: {
    // position: "absolute",
    // top: 0,
    // left: 0,
    // right: 0,
    // height: "45%",
    // backgroundColor: "rgba(255,255,255,0.08)",
    // borderTopLeftRadius: 28,
    // borderTopRightRadius: 28,
  },

  avatar: {
    width: 50,
    height: 50,
    borderRadius: 50,

    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.18)",
  },

  chatInfo: {
    flex: 1,
    marginLeft: 14,
  },

  username: {
    color: "white",
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.2,
  },

  recentMessage: {
    color: "#C7C7CC",
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    // width: width * 0.55,
  },

  unreadMessage: {
    color: "white",
    fontWeight: "700",
  },

  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF375F",

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 7,
    marginLeft: 8,
  },

  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },

  activeDot: {
    position: "absolute",
    bottom: 2,
    right: 2,

    width: 16,
    height: 16,
    borderRadius: 8,

    backgroundColor: "#30D158",
    borderWidth: 2,
    borderColor: "#0B0B0F",
  },
});