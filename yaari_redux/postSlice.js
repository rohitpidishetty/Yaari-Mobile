import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "yaari-user-post",
  initialState: { postObject: {} },
  reducers: {
    mountPost: (state, payload) => {
      state.postObject = payload
    },
    demountPost: (state) => {
      state.postObject = {}
    }
  }
});


export const { mountPost, demountPost } = postSlice.actions;
export default postSlice.reducer;