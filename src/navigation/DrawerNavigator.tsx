import LeadDashboardScreen from '../screens/LeadDashboardScreen';
import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

import DashboardSummary from '../screens/DashboardSummary';
import AttendanceScreen from '../screens/AttendanceScreen';
import AttendanceHistory from '../screens/AttendanceHistory';
import UserProfile from '../screens/UserProfile';
import CallAnalyticsScreen from '../screens/CallAnalyticsScreen';
import CustomDrawer from './CustomDrawer';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
      }}
      drawerContent={props => <CustomDrawer {...props} />}>
      <Drawer.Screen name="Dashboard" component={DashboardSummary} />
      <Drawer.Screen
        name="LeadDashboardScreen"
        component={LeadDashboardScreen}
        options={{title: 'Lead Dashboard'}}
      />

      <Drawer.Screen name="Attendance" component={AttendanceScreen} />

      <Drawer.Screen name="AttendanceHistory" component={AttendanceHistory} />

      <Drawer.Screen name="UserProfile" component={UserProfile} />

      <Drawer.Screen name="CallAnalytics" component={CallAnalyticsScreen} />
    </Drawer.Navigator>
  );
}
