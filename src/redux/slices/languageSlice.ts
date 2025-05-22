import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  language: 'en'
};

// Setting up user slice (redux-toolkit)
// All the magic happens here, lol.
export const languageSlice = createSlice({
  name: 'language',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setLanguage: (state, action) => {
      console.log('------ setLanguage action.payload------');
      console.log(action,state);
      state.language = action.payload;
    },
  },
});

export const {
  setLanguage,
} = languageSlice.actions;

// The function below is called a selector and allows us to select a value from
// the stateSelectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter./// value)`
// export const selectLang = (state: any) => state.language;

export default languageSlice.reducer;