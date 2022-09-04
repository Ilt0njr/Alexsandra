import { createSlice, configureStore } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "payment",
  initialState: {
    adress: { CEP: "", localidade: "", logradouro: "", uf: "", n: "" },
    shipping: { name: "", amount: 0, range: 0, time: 0 },
    step: 0,
    status: false,
  },
  reducers: {
    changeAdress(state, { payload }) {
      return { ...state, adress: payload, step: 1 };
    },
    changeShipping(state, { payload }) {
      return { ...state, shipping: payload, step: 2 };
    },
  },
});

const store = configureStore({
  reducer: {
    payment: slice.reducer,
  },
});

export const { changeAdress, changeShipping } = slice.actions;
export default store;
