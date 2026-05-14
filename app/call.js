import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, View } from "react-native";


// import {
//   useCallStateHooks
// } from '@stream-io/video-react-native-sdk';

import md5 from "md5";

export default function call() {

  function MicControl() {
    const { useMicrophoneState } = useCallStateHooks();
    const { microphone, isMute } = useMicrophoneState();

    return (
      <Pressable
        onPress={() => microphone?.toggle()}
        style={styles.micBtn}
      >
        <Ionicons
          name={isMute ? "mic-off" : "mic"}
          size={26}
          color="white"
        />
      </Pressable>
    );
  }


  const { q, i, f, cid } = useLocalSearchParams();
  console.log(q, i, f, cid)

  const callingToName = q;
  const callingToImage = i;
  const callingFromName = f;

  const id = md5(callingFromName);

  // const [client, setClient] = useState(null);
  // const [call, setCall] = useState(null);
  // const [joined, setJoined] = useState(false);

  // const [status, setStatus] = useState("Ringing");

  // useEffect(() => {
  //   const init = async () => {
  //     try {
  //       const apiKey = "ygeegbnj4cbw";

  //       const tok = await axios.get(
  //         `https://yaari.vercel.app/generate_token/?username=${id}`
  //       );

  //       const token = tok.data.token;

  //       const user = {
  //         id,
  //         name: callingFromName,
  //       };

  //       const streamClient = new StreamVideoClient({
  //         apiKey,
  //         user,
  //         token,
  //       });

  //       setClient(streamClient);

  //       const callInstance = streamClient.call("default", cid);

  //       await callInstance.getOrCreate({
  //         ring: true,
  //         video: false,
  //       });

  //       await callInstance.join();

  //       setCall(callInstance);
  //       setJoined(true);
  //     } catch (e) {
  //       console.log(e);
  //     }
  //   };

  //   init();
  // }, []);

  // const hangUp = async () => {
  //   if (call) {
  //     await call.leave();
  //     navigation.goBack();
  //   }
  // };

  // if (!joined || !client || !call) {
  //   return (
  //     <View style={styles.loading}>
  //       <Text style={{ color: "white" }}>Connecting...</Text>
  //     </View>
  //   );
  // }

  // return (
  //   <StreamVideo client={client}>
  //     <StreamCall call={call}>
  //       <StreamTheme style={styles.container}>

  //         {/* Avatar Section */}
  //         <View style={styles.center}>
  //           <Image source={{ uri: callingToImage }} style={styles.avatar} />
  //           <Text style={styles.name}>{callingToName}</Text>
  //           <Text style={styles.status}>{status}</Text>
  //         </View>

  //         {/* Controls */}
  //         <View style={styles.controls}>

  //           {/* End Call */}
  //           <Pressable onPress={hangUp} style={styles.endBtn}>
  //             <MaterialIcons name="call-end" size={30} color="white" />
  //           </Pressable>

  //           {/* Mic toggle */}
  //           <MicControl />

  //         </View>

  //         <SpeakerLayout />
  //       </StreamTheme>
  //     </StreamCall>
  //   </StreamVideo>
  // );

  return (
    <View>
      <Text>Next update</Text>
    </View>
  )

}


