import React, { } from 'react';


import { navigationRef } from './src/navigation/RootNavigation';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/Login/Login';
import DashBoard from './src/Dashboard';
import FlashMessage from 'react-native-flash-message';
import AttendanceScreen from './src/screens/AttendanceScreen';
import TaskSummary from './src/screens/TaskSummary';
import DashboardSummary from './src/screens/DashboardSummary';

const Stack = createNativeStackNavigator();
const App = () => {


  // useEffect(() => {
  //   onSearch(searchQuery);
  // }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false, animation: 'fade_from_bottom', }}>

        <Stack.Screen name="DashBoard" component={DashboardSummary} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="TaskSummary" component={TaskSummary} />
        <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} />
      </Stack.Navigator>
      <FlashMessage position="top" />
    </NavigationContainer>

  );
};





export default App;
