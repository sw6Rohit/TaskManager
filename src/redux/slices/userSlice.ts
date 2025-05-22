// src/redux/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UserState = {
  userInfo: any | null;
};

const initialState: UserState = {
  userInfo: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<any>) {
      state.userInfo = action.payload;
    },
    clearUser(state) {
      state.userInfo = null;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
