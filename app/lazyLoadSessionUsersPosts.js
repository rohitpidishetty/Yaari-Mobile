import { mountPost } from "@/yaari_redux/postSlice";
import { useRouter } from "expo-router";
import { FlatList, Image, Pressable, View } from "react-native";
import { useDispatch } from "react-redux";

export default function LazyLoadSessionUsersPosts({ posts }) {
  const dispatch = useDispatch();
  const route = useRouter();

  const sortedPosts = [...(posts || [])].sort(
    (a, b) => b.post_time_of_upload - a.post_time_of_upload
  );

  return (
    <FlatList
      data={sortedPosts}
      numColumns={3}
      keyExtractor={(post, index) =>
        post?.post_id?.toString() || index.toString()
      }
      renderItem={({ item }) => {
        if (!item?.post_link) return null;

        return (
          <View style={{ flex: 1, margin: 2 }}>
            <Pressable
              onPress={() => {
                dispatch(mountPost(item));
                route.push("/imageview");
              }}
            >
              <Image
                style={{ width: "100%", aspectRatio: 1 }}
                source={{ uri: item.post_link }}
              />
            </Pressable>
          </View>
        );
      }}
    />
  );
}