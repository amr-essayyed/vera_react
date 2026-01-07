import { configureStore } from "@reduxjs/toolkit";
import masterOrderLinesReducer from "@/state/masterOrder/masterOrderLinesSlice";
import masterOrderReducer from "@/state/masterOrder/masterOrderSlice";

const store = configureStore({
    reducer: {
        masterOrder: masterOrderReducer,
        masterOrderLines: masterOrderLinesReducer,
    },

});

export { store };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ReturnType<typeof store.dispatch>;