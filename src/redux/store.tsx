import * as toolkitRaw from "@reduxjs/toolkit";
const { configureStore } = (
  "default" in toolkitRaw ? toolkitRaw.default : toolkitRaw
) as typeof toolkitRaw;
import canvasSliceReducer from "./canvasSlice";

const store = configureStore({
  reducer: {
    canvas: canvasSliceReducer,
  },
});
export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
