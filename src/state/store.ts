import {configureStore} from "@reduxjs/toolkit";
import counterReducer from "./counter/counterSlice"

const store = configureStore({
    reducer:{
        counter: counterReducer,
    },

});

export { store };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ReturnType<typeof store.dispatch>;