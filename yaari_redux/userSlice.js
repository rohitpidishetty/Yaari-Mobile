import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "yaari-user",
  initialState: { userDetails: {} },
  reducers: {
    mountUser: (state, payload) => {
      state.userDetails = payload
    },
    demountUser: (state) => {
      state.userDetails = {}
    }
  }
});


export const { mountUser, demountUser } = userSlice.actions;
export default userSlice.reducer;