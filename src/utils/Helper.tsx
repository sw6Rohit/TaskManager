import React, { Component } from 'react';
import {
    ActivityIndicator,
    Image,
    Linking,
    Platform,
    Text,
    View,
    ToastAndroid,
    Alert,
    PermissionsAndroid
} from 'react-native';

import NetInfo from '@react-native-community/netinfo';
import Colors from './Colors';
import Geolocation from '@react-native-community/geolocation';

import { NativeModules } from 'react-native';

const { LocationModule } = NativeModules;

export const checkConnection=()=> {
    NetInfo.fetch().then(state => {
        console.log('NetInfo, is ' + (state.isConnected ? 'online' : 'offline'));
        return state.isConnected;
    });
};

export function noDataView() {
    return (
        <View style={{ height: '100%', alignSelf: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 20, color: '#777777' }}>No Data</Text>
        </View>
    );
}

// export const BackArrow = () => {
//     return (
//         <AntDesign name="arrowleft" size={18} color={'#ffffff'} />
//     )
// }

export function headerWithLogo() {
    return (
        <View style={{ alignItems: 'center', alignSelf: 'center' }}>
            {/* <ResponsiveImage
                initWidth={hp(25)}
                initHeight={hp(10)}
                resizeMode="contain"
                source={require('../../assests/images/logo/logo.png')}
            /> */}
        </View>
    );
}



export function loaderWithButton(status: boolean) {
    return (
        <ActivityIndicator size="large" animating={status} color={Colors.primary} />
    );
}


export function isEmailvalidate(email: string) {
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (reg.test(email) === false) {
        return false;
    } else {
        return true;
    }
}

export function toast(msg: string) {
    if (Platform.OS == "android") {
        ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
        Alert.alert(msg);
    }
}



export function openLocation(lat: string, lng: string): void {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${lat},${lng}`;
    const label = 'Custom Label';
    const url: any = Platform.select({
        ios: `${scheme}${label}@${latLng}`,
        android: `${scheme}${latLng}(${label})`
    });
    console.log(url)
    Linking.openURL(url);
}


export function notLoginAlert(navigation: any) {
    Alert.alert('Message', 'You are not login. Please login.', [
        {
            text: 'Cancel',
            onPress: () => console.log('Cancel Pressed'),
            style: 'cancel',
        },
        { text: 'Login', onPress: () => navigation.navigate("Login") },
    ]);
}


export async function findCoordinates() {

    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: 'Alter',
                message: `We want your location to help you to find things`,
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            return new Promise((resolve, reject) => {
                Geolocation.getCurrentPosition(position => {
                    resolve(position)
                });
            })
        }

    } catch (err) {
        console.warn(err);
    }


}
export async function getAddressFromLatLng(lat:any, lng:any) {
  try {
    const result = await LocationModule.getAddressFromCoordinates(lat, lng);
    return result;
  } catch (err) {
    console.error('Error getting address:', err);
    return null;
  }
}

export function camelize(str: string) {
    console.log('str---------------');
    console.log(str);
    console.log('str---------------');

    return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}