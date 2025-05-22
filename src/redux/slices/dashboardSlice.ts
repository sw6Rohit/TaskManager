import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Constant from '../../utils/Constant';

const initialState = {
  menuOptions: [],
  loading: false,
};

// Setting up user slice (redux-toolkit)
// All the magic happens here, lol.
export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    fetchDashboardMenuOptions: (state, action: PayloadAction<any>) => {
      const { res, loading } = action.payload;
      
      state.menuOptions = res;
      state.loading = loading;
    },
  },
});

export const { fetchDashboardMenuOptions } = dashboardSlice.actions;

// The function below is called a selector and allows us to select a value from
// the stateSelectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter./// value)`
// export const selectUser = (state: any) => state.sideBarMenu;

export default dashboardSlice.reducer;