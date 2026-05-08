import axios from 'axios';
import { initializeApp } from 'firebase/app';
import { get, getDatabase, onValue, ref, update } from "firebase/database";
import { getMessaging } from 'firebase/messaging';
import React, { useContext } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { ActivityNotification } from './HelperClasses/Notify.js';
import firebaseConfig from "./HelperClasses/SDK.js";
import { user } from './SessionUser.js';
import "./Styles/LoginPage.css";


function LoginPage() {

  const app = initializeApp(firebaseConfig);
  const messaging = getMessaging(app);
  const [hidden, setHidden] = React.useState("password");
  const [style, setStyle] = React.useState("show");
  const [styleOpp, setStyleOpp] = React.useState("hide");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [linkedEmail, setLinkedEmail] = React.useState("");
  const [loginHit, setLoginHits] = React.useState(0);
  const { sessionUser, setSessionUser, notification, setNotification } = useContext(user);
  const navigation = useNavigate();
  const [keyChangeOPT, setKeyChangeOPT] = React.useState(false);
  const [newKey, setNewKey] = React.useState(false);
  const [newPassword, setNewPassword] = React.useState("");


  const db = getDatabase();
  React.useEffect(() => {
    document.body.style.backgroundColor = "black";
    if (localStorage.getItem('yaari-session-user') != undefined && localStorage.getItem('yaari-session-user') != null) {
      navigation('/user');
    }
  }, [])

  const [otpShow, setOtpShow] = React.useState(false);
  const [logginUserName, setLogginUsername] = React.useState("");


  return (
    <div className='login'>
      <div className='login-left'>
        <img src='assets/yaari.png' />
      </div>
      <div className='login-right'>
        <b>Yaari {"–"} जीवनस्य क्षणं स्पृहय!</b>
        <div>
          <input onChange={(e) => setUsername(e.target.value.trim())} placeholder='Username' />
          <input onChange={(e) => setPassword(e.target.value.trim())} type={hidden} placeholder='password' />
          {otpShow && <input type='number' onChange={(e) => {
            if (e.target.value.trim().length == 5) {
              axios.post("https://yaari.vercel.app/yaari_two_step_verify/",
                {
                  otp: e.target.value.trim(),
                  username: logginUserName
                },
                {
                  headers: { "Content-Type": "application/json" }
                }
              ).then(res => {
                if (res.data.status == 200) {
                  localStorage.setItem('yaari-session-user', logginUserName);
                  navigation('/user');
                }
                else
                  ActivityNotification("Invalid OTP");
              })
            }
          }} placeholder='Please enter OTP' />}
          <div style={{
            cursor: "pointer"
          }} onClick={() => {
            if (!/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
              navigator.vibrate(50);
            setHidden(hidden == "password" ? "text" : "password");
            setStyle(style == "show" ? "hide" : "show");
            setStyleOpp(styleOpp == "show" ? "hide" : "show");
          }} id='show-password'>
            <FaEye className={style} />
            <FaEyeSlash className={styleOpp} />
          </div>
          <button onClick={() => {
            setLoginHits((loginHit) => loginHit + 1);
            if (!/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream)
              navigator.vibrate(50);
            if (username.length == 0 || password.length == 0) {
              ActivityNotification("Enter proper details");
              return;
            }
            onValue(ref(db, 'users/'), (snapshot) => {
              if (snapshot.exists()) {
                const collection = snapshot.val();
                const users = Object.keys(collection);

                if (!users.includes(username)) {
                  ActivityNotification("User not found, kindly sign up to create an account!!");
                  return;
                }

                const userData = collection[username];


                if (userData.password !== password) {
                  ActivityNotification("Incorrect password entered");
                  return;
                }

                setSessionUser(userData);

                if (userData.email_verified) {
                  setOtpShow(true);
                  ActivityNotification("For security code please check your email inbox");
                  setLogginUsername(username);
                  axios.post("https://yaari.vercel.app/yaari_two_step_verification/", {
                    verify_email: userData.email,
                    username: username
                  }, {
                    headers: { "Content-Type": "application/json" }
                  })

                } else {
                  setLoginHits(0);
                  localStorage.setItem('yaari-session-user', userData.username);
                  navigation('/user');
                }
              } else {
                ActivityNotification("User not found");
              }
            }, { onlyOnce: true });

          }}>Log in</button>
          <Link to="/sign-up">Dont have an account ?</Link>
          {loginHit > 4 &&
            <>
              <br />
              <input onChange={(e) => setLinkedEmail(e.target.value.trim())} placeholder='Enter linked email' />
              {keyChangeOPT && <input onChange={(e) => {
                if (e.target.value.trim().length == 5) {
                  axios.post("https://yaari.vercel.app/yaari_two_step_verify/",
                    {
                      otp: e.target.value.trim(),
                      username: username
                    },
                    {
                      headers: { "Content-Type": "application/json" }
                    }
                  ).then(res => {
                    if (res.data.status == 200) {
                      setNewKey(true);
                      setKeyChangeOPT(false);
                    }
                    else
                      ActivityNotification("Invalid OTP");
                  })
                }
              }} placeholder='Enter OTP' />}
              {newKey && <input onChange={(e) => {
                setNewPassword(e.target.value.trim())
              }} placeholder='Enter a new password' />}
              {newKey && <button id="change-pw" onClick={() => {
                if (newPassword.length > 5) {
                  document.getElementById("change-pw").innerText = "Updating...";
                  update(ref(db, `users/${username}`), { password: newPassword }).then(() => {
                    ActivityNotification("Password updated");
                    setLoginHits(0);
                    setNewKey(false);
                  }).catch(() => {
                    ActivityNotification("Problem occured while updating your password, try again later")
                  })
                }
                else ActivityNotification("Enter a valid password, length of the new password should be greater than 5")
              }}>Change password</button>}
              <button id="send-otp" onClick={() => {
                document.getElementById("send-otp").innerText = "Sending OPT...";
                get(ref(db, 'users/')).then(payload => {
                  if (payload.exists()) {
                    const collection = payload.val();
                    if (Object.keys(collection).includes(username)) {
                      if (collection[username].email === linkedEmail) {
                        axios.post("https://yaari.vercel.app/yaari_two_step_verification/", {
                          verify_email: linkedEmail,
                          username: username
                        }, {
                          headers: { "Content-Type": "application/json" }
                        }).then(
                          () => {
                            setKeyChangeOPT(true);
                            document.getElementById("send-otp").innerText = "Submit";
                            document.getElementById("send-otp").disabled = true;
                          }
                        )
                      }
                      else {
                        ActivityNotification("Entered email does not match");
                        document.getElementById("send-otp").innerText = "Submit";
                      }
                    }
                    else {
                      document.getElementById("send-otp").innerText = "Submit";
                      ActivityNotification("Username is not associated with Yaari");
                    }
                  }
                })
              }}>Submit</button>
            </>
          }
        </div>
      </div>
    </div>
  )
}

export default LoginPage