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
      </Stack>
    </Provider>
  );
}
