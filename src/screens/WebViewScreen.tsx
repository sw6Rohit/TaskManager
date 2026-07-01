import React from 'react';
import {ActivityIndicator, View} from 'react-native';
import {WebView} from 'react-native-webview';

const PREFIX_URL = 'https://sves.university99.com';

export default function WebViewScreen({navigation, route}: any) {
  const {url} = route.params;

  const handleNavigation = (navState: any) => {
    const currentUrl = navState.url;

    console.log('Current URL:', `${PREFIX_URL}${url}`);

    // if (currentUrl.startsWith(PREFIX_URL)) {
    //   navigation.replace('StudentList', {
    //     webUrl: currentUrl,
    //   });
    // }
  };

  return (
    <View style={{flex: 1}}>
      <WebView
        source={{uri: `${PREFIX_URL}${url}`}}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        onNavigationStateChange={handleNavigation}
        renderLoading={() => (
          <ActivityIndicator size="large" style={{flex: 1}} />
        )}
      />
    </View>
  );
}
