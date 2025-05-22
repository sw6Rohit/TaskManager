import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  cords: null,
  error: null
};

// Setting up user slice (redux-toolkit)
// All the magic happens here, lol.
export const locationSlice = createSlice({
  name: 'location',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
   
    setLocation: (state, action) => {
      console.log('------ setLocation action.payload ------');
      console.log(action);
      const { cords, loading } = action.payload;
      state.loading = loading;
      state.cords = cords
    },

  },
});

export const { setLocation } = locationSlice.actions;

// The function below is called a selector and allows us to select a value from
// the stateSelectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter./// value)`
export const selectUser = (state: any) => state.user;

export default locationSlice.reducer;