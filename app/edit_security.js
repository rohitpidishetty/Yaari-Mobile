import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { getDatabase, ref, update } from 'firebase/database';
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector } from "react-redux";
import Alert from "./alert";

export default function EditSecurity() {
  const user = useSelector((state) => state.user.userDetails.payload);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const db = getDatabase();

  const currentCollection = ref(db, `users/${user?.username}/`);



  function reflect(payload) {
    update(currentCollection, payload).then(e => {
      setHeader("Hurray!!")
      setMessage("Data changed successfully");
      setShowModal(true);
    }).catch(() => {
      setHeader("Oops!!")
      setMessage("Unable to make changes currently, please try again later")
      setShowModal(true);
    })
  }


  function changeAccountStatus(status) {


    updateUserData(status === 'private', 'private_account');

  }
  function shareLiveLocation(status) {
    updateUserData(status, 'live_location')
  }

  function updateUserData(data, key) {
    switch (key) {
      case 'live_location':
        console.log(data)
        reflect({
          live_location: data
        })
        break;
      case 'bio-data':
        reflect({
          bio_status: data.trim()
        });
        break;
      case 'display-picture-link':
        reflect({
          profile_picture: data.trim()
        })
        break;
      case 'bg-picture-link':
        reflect({
          background_picture: data.trim()
        })
        break;
      case 'password':
        if (data.trim().length == 0) return;
        reflect({
          password: data.trim()
        })
        break;
      case 'number':
        reflect({
          phone: data.trim()
        })
        break;
      case 'name':
        reflect({
          name: data.trim()
        })
        break;
      case 'email':
        reflect({
          email: data.trim()
        })
        break;
      case 'portfolio':
        reflect({
          portfolio: data.trim()
        })
        break;
      case 'private_account':

        reflect({
          private_account: data
        })
        break;

    }
  }



  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [header, setHeader] = useState("");




  return (
    <SafeAreaView style={styles.container}>
      <Alert message={message} setShowModal={setShowModal} showModal={showModal} header={header} />
      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="mail-outline" size={20} color="#fff" />
          <Text style={styles.label}>{user?.email}</Text>
        </View>

        <TouchableOpacity
          disabled={user?.email_verified}
          style={[
            styles.button,
            user?.email_verified && styles.disabledBtn,
          ]}
          onPress={() => {
            setHeader("Security")
            setMessage("Check your email inbox for OTP");
            setShowModal(true);

            axios.post("https://yaari.vercel.app/yaari_two_step_verification/",
              {
                verify_email: user?.email,
                username: user?.username
              },
              {
                headers: { "Content-Type": "application/json" }
              }
            ).then(res => {
              if (res.data.status == 200) {

                setOtpSent(true);
                setShowModal(false);
              }
            })
          }}
        >
          <Text style={styles.btnText}>
            {user?.email_verified ? "Verified" : "Verify Email"}
          </Text>
        </TouchableOpacity>

        {otpSent && (
          <View style={styles.otpBox}>
            <TextInput

              value={otp}
              onChangeText={setOtp}
              placeholder="Enter OTP"
              placeholderTextColor="#777"
              style={styles.input}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                axios.post("https://yaari.vercel.app/yaari_two_step_verify/",
                  {
                    otp: otp,
                    username: user?.username
                  },
                  {
                    headers: { "Content-Type": "application/json" }
                  }
                ).then(res => {
                  if (res.data.status == 200) {
                    update(ref(db, `users/${user?.username}/`), { email_verified: true }).then(snap => {
                      setHeader("Hurray!!")
                      setMessage("Congratualations you are verified now!!");
                      setShowModal(true);
                      setOtpSent(false);
                    })
                  }
                  else {
                    setHeader("Oops!!")
                    setMessage("Invalid OTP");
                    setShowModal(true);
                  }
                })
                setOtp("");

              }}
            >
              <Text style={styles.btnText}>Verify OTP</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Ionicons name="lock-closed-outline" size={20} color="#fff" />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Change password"
            placeholderTextColor="#777"
            style={styles.input}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => updateUserData(password, "password")}
        >
          <Text style={styles.btnText}>Update Password</Text>
        </TouchableOpacity>
      </View>

      <View>

        {
          user?.private_account ?
            <View style={styles.card}>
              <Ionicons name="person-circle-outline" size={22} color="#fff" />

              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  changeAccountStatus(
                    "public"
                  )
                }
              >
                <Text style={styles.btnText}>
                  Make account as public
                </Text>
              </TouchableOpacity>
            </View> :

            <View style={styles.card}>
              <Ionicons name="person-circle-outline" size={22} color="#fff" />

              <TouchableOpacity
                style={styles.button}
                onPress={() =>
                  changeAccountStatus("private")
                }
              >
                <Text style={styles.btnText}>
                  Make account as private
                </Text>
              </TouchableOpacity>
            </View>

        }
      </View>

      <View>
        {
          !user?.live_location ?
            <View style={styles.card}>
              <Ionicons name="person-circle-outline" size={22} color="#fff" />
              <TouchableOpacity style={styles.button} onPress={() => shareLiveLocation(true)}>
                <Text style={styles.btnText}>Share live location</Text>
              </TouchableOpacity>
            </View> :
            <View style={styles.card}>
              <Ionicons name="person-circle-outline" size={22} color="#fff" />

              <TouchableOpacity style={styles.button} onPress={() => shareLiveLocation(false)}>
                <Text style={styles.btnText}>Turn off live sharing</Text>
              </TouchableOpacity>
            </View>
        }
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    padding: 16,
  },

  card: {
    backgroundColor: "#121212",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    gap: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  label: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },

  input: {
    flex: 1,
    color: "white",
    fontSize: 14,
    paddingVertical: 6,
  },

  button: {
    backgroundColor: "#1f1f1f",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },

  disabledBtn: {
    opacity: 0.5,
  },

  otpBox: {
    marginTop: 10,
    gap: 10,
  },
});