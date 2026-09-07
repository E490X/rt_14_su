import { configureStore } from "@reduxjs/toolkit";
import { customizationSlice } from "./reducers/customizationSlice";
import { authSlice } from "./reducers/authSlice";
import deviceDataSlice from "./reducers/deviceDataSlice";

const store = configureStore({
  reducer: {
    customization: customizationSlice.reducer,
    auth: authSlice.reducer,
    deviceData: deviceDataSlice,
  },
});

export default store;
