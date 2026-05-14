import { configureStore } from "@reduxjs/toolkit";
import commentReducer from "./commentsSlice.js";
import postReducer from "./postSlice.js";
import userReducer from "./userSlice.js";
const store = configureStore({
  reducer: {
    user: userReducer,
    post: postReducer,
    comments: commentReducer
  }
});

export default store;