import React, { useEffect } from 'react';

import { navigate, navigationRef } from './src/navigation/RootNavigation';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/Login/Login';
import DashBoard from './src/Dashboard';
import FlashMessage from 'react-native-flash-message';
import AttendanceScreen from './src/screens/AttendanceScreen';
import TaskSummary from './src/screens/TaskSummary';
import DashboardSummary from './src/screens/DashboardSummary';
import AttendanceHistory from './src/screens/AttendanceHistory';
import StudentList from './src/screens/StudentList';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import UserProfile from './src/screens/UserProfile';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './src/redux/store';
import { clearUser } from './src/redux/slices/userSlice';
import TakePicture from './src/screens/TakePicture';
import DeviceInfo from 'react-native-device-info';

const Stack = createNativeStackNavigator();
const App = () => {


  const checkIfEmulatorAndDebugging = async () => {
  const isEmulator = await DeviceInfo.isEmulator();
  console.log('Emulator:', DeviceInfo);
  const isADBEnabled = await DeviceInfo.isAdbEnabled(); // Android only

  console.log('ADB Enabled:', isADBEnabled);
};


  const dispatch=useDispatch();
   const SESSION_TIMEOUT_MS = 43200000;
     const {userInfo,taskMaster} = useSelector((state: RootState) => state?.user);
     const loginTime = useSelector((state: RootState) => state.user.loginTime);

    //  console.log(userInfo, loginTime,taskMaster);
     

  useEffect(() => {
    const currentRoute = navigationRef.getCurrentRoute()?.name;
  
    if (loginTime === -2208988800000 && !userInfo && currentRoute !== 'SplashScreen') {
      const timer = setTimeout(() => {
        const routeAfterDelay = navigationRef.getCurrentRoute()?.name;
        if (routeAfterDelay !== 'Login') {
          navigate('Login', {});
        }
      }, 5000);
  
      return () => clearTimeout(timer);
    }
    checkIfEmulatorAndDebugging();
  }, [userInfo, loginTime]);
  
  const restoreSession = async () => {

    if (loginTime && userInfo) {
      const now = new Date().getTime();
      const timeDiff = now - parseInt(loginTime);

      if (timeDiff < SESSION_TIMEOUT_MS) {
      }
      else {
          //  dispatch(clearUser());

      }
    }
  };

  useEffect(() => {

    if (loginTime) {
      const interval = setInterval(() => {
        restoreSession()
      }, 6000); // check every minute

      return () => clearInterval(interval);
    }
  }, [userInfo]);

  return (
    <SafeAreaProvider>
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false, animation: 'fade_from_bottom', }}>
        <Stack.Screen name="DashBoard" component={DashboardSummary} />
        <Stack.Screen name="DashBoardC" component={DashBoard} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="UserProfile" component={UserProfile} />
        <Stack.Screen name="TaskSummary" component={TaskSummary} />
        <Stack.Screen name="AttendanceScreen" component={AttendanceScreen} />
        <Stack.Screen name="AttendanceHistory" component={AttendanceHistory} />
        <Stack.Screen name="StudentList" component={StudentList} />
        <Stack.Screen name="TakePicture" component={TakePicture} />
      </Stack.Navigator>
      <FlashMessage position="top" />
    </NavigationContainer>
    </SafeAreaProvider>
  );
};
export default App;
