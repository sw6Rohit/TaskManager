// src/redux/slices/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type UserState = {
  userInfo: any | null;
  taskMaster: any | null;
};

const initialState: UserState = {
  userInfo: null,
  taskMaster:null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<any>) {
      state.userInfo = action.payload;
    },
    setTaskMaster(state, action: PayloadAction<any>) {
      state.taskMaster = action.payload;
    },
    clearUser(state) {
      state.userInfo = null;
      state.taskMaster = null;
    },
  },
});

export const { setUser, clearUser,setTaskMaster } = userSlice.actions;
export default userSlice.reducer;
