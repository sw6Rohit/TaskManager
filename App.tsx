import React, { } from 'react';


import { navigationRef } from './src/navigation/RootNavigation';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './src/Login/Login';
import DashBoard from './src/Dashboard';
import FlashMessage from 'react-native-flash-message';

const Stack = createNativeStackNavigator();
const App = () => {


  // useEffect(() => {
  //   onSearch(searchQuery);
  // }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false, animation: 'fade_from_bottom', }}>

        <Stack.Screen name="DashBoard" component={DashBoard} />
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
      <FlashMessage position="top" />
    </NavigationContainer>

  );
};





export default App;
