import { FlatList, Text, View } from "react-native";

export default function lazyLoadSessionUsersPosts({ posts }) {
  console.log(posts)
  return (
    <FlatList data={posts} keyExtractor={({ post }) => post.id} renderItem={(post) => {
      return (
        <View>
          <Text>{post.title}</Text>
        </View>
      )
    }} />
  )
}