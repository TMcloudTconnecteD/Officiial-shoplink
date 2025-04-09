import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  categories: [],
  products: [],
  checked: [],
  radio: [],
  brandCheckboxes: {},
  checkedBrands: [],
  shops: [],              // 🆕 all shops
  selectedShop: null,     // 🆕 currently selected shop
};

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setCategories: (state, action) => {
      state.categories = action.payload;
    },
    setProducts: (state, action) => {
      state.products = action.payload;
    },
    setChecked: (state, action) => {
      state.checked = action.payload;
    },
    setRadio: (state, action) => {
      state.radio = action.payload;
    },
    setSelectedBrand: (state, action) => {
      state.selectedBrand = action.payload;
    },
    setShops: (state, action) => {
      state.shops = action.payload;
    },
    setSelectedShop: (state, action) => {
      state.selectedShop = action.payload;
    },
  },
});

export const {
  setCategories,
  setProducts,
  setChecked,
  setRadio,
  setSelectedBrand,
  setShops,           // 🆕 export action
  setSelectedShop,    // 🆕 export action
} = shopSlice.actions;

export default shopSlice.reducer;
