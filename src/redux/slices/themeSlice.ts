import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light'
};

// Setting up user slice (redux-toolkit)
// All the magic happens here, lol.
export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setTheme: (state, action) => {
      console.log('------ setLanguage action.payload------');
      console.log(action, state);
      state.theme = action.payload;
    },
  },
});

export const {
  setTheme,
} = themeSlice.actions;

// The function below is called a selector and allows us to select a value from
// the stateSelectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter./// value)`
// export const selectLang = (state: any) => state.language;

export default themeSlice.reducer;