import { createSlice } from "@reduxjs/toolkit";

const commentReducer = createSlice({
  name: "yaari-post-comments",
  initialState: { postComments: {} },
  reducers: {
    mountComments: (state, payload) => {
      state.postComments = payload
    },
    demountComments: (state) => {
      state.postComments = {}
    }
  }
});


export const { mountComments, demountComments } = commentReducer.actions;
export default commentReducer.reducer;