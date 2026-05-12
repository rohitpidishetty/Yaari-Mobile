import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Image, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();
  const userObject = useSelector((state) => state.user.userDetails);


  const tabs = [
    { name: "Home", icon: "home-outline", activeIcon: "home", path: "/main" },
    { name: "Camera", icon: "camera-outline", activeIcon: "camera", path: "/camera" },
    { name: "Search", icon: "search-outline", activeIcon: "search", path: "/explore" },
    { name: "Messages", icon: "chatbox-outline", activeIcon: "chatbox", path: "/message_pool" },
    { name: "Notifications", icon: "notifications-outline", activeIcon: "notifications", path: "/notifications" },
    { name: "Profile", icon: "person-circle-outline", activeIcon: "person-circle", path: "/user" },
  ];

  return (
    <View style={styles.footerContainer}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;

        if (tab.name === "Profile") {
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabButton}
              onPress={() => router.push(tab.path)}
            >
              <Image style={{ width: 24, height: 24, borderRadius: 50 }} source={{ uri: userObject?.payload?.profile_picture }} />

            </TouchableOpacity>
          )
        }
        else

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabButton}
              onPress={() => router.push(tab.path)}
            >
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={24}
                color={isActive ? "#007AFF" : "#8E8E93"}
              />

            </TouchableOpacity>
          );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    flexDirection: "row",
    height: Platform.OS === "ios" ? 85 : 65,
    backgroundColor: "rgba(5, 4, 4, 0.9)",
    width: "100%",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  }
});