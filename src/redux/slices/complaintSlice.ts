import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  response: null,
  error: null
};

// Setting up user slice (redux-toolkit)
// All the magic happens here, lol.
export const complaintSlice = createSlice({
  name: 'complaint',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
   
    addComplaintUser: (state, action) => {
      console.log('------ complaint action.payload ------');
      console.log(action);
      const { res, loading } = action.payload;
      state.loading = loading;
      state.response = res
    },

    cleanUserData: (state, action) => {
      console.log('------ clean complaint action.payload ------');
      console.log(action);
      state.loading = false;
      state.response = null
    },
  },
});

export const { cleanUserData } = complaintSlice.actions;

// The function below is called a selector and allows us to select a value from
// the stateSelectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter./// value)`
export const selectUser = (state: any) => state.user;

export default complaintSlice.reducer;