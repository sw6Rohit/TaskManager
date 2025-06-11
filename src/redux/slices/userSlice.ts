// src/redux/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
type UserState = {
  userInfo: any | null;
  taskMaster: any | null;
  loginTime: any | null;
};

const initialState: UserState = {
  userInfo: null,
  taskMaster: null,
  loginTime: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<any>) {
      state.userInfo = action.payload;
      state.loginTime = new Date().getTime(); // set login time when user logs in
    },
    setTaskMaster(state, action: PayloadAction<any>) {
      state.taskMaster = action.payload;
    },
    clearUser(state) {
      state.userInfo = null;
      state.taskMaster = null;
      state.loginTime = new Date('1900-01-01T00:00:00Z').getTime();
    },
  },
});

export const { setUser, clearUser, setTaskMaster } = userSlice.actions;
export default userSlice.reducer;
