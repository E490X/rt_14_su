import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  imeiNumber: "",
};

export const deviceDataSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setimeiNumber: (state, action) => {
      state.imeiNumber = action.payload;
    },
  },
});

export const { setimeiNumber } = deviceDataSlice.actions;
export default deviceDataSlice.reducer;
