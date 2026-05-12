import { Stack } from "expo-router";
import { Provider } from "react-redux";
import store from "../yaari_redux/store";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack
        screenOptions={{
          animationTypeForReplace: "push",
          gestureEnabled: true,
          gestureDirection: "horizontal",
          headerStyle: { backgroundColor: "#F2F2F7" },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="index"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="signup"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="main"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="user"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="imageview"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="comments"
          options={{ headerShown: false, animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="friends"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="edit_user"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="edit_profile"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="edit_security"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="notifications"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="explore"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="post_comments"
          options={{ headerShown: false, animation: "slide_from_bottom" }}
        />
        <Stack.Screen
          name="yaari_user"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="camera"
          options={{ headerShown: false, animation: "fade_from_bottom" }}
        />
        <Stack.Screen
          name="upload_image"
          options={{ headerShown: false, animation: "fade_from_bottom" }}
        />
        <Stack.Screen
          name="message_pool"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="chat_room"
          options={{ headerShown: false, animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="call"
          options={{ headerShown: false, animation: "fade_from_bottom" }}
        />
      </Stack>
    </Provider>
  );
}
