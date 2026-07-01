import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Animated,
  Image,
  Platform,
  PermissionsAndroid,
  Linking,
  ScrollView,
} from 'react-native';

import {Formik} from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../utils/Colors';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {RootState} from '../redux/store';
import {clearUser, setMenus, setUser} from '../redux/slices/userSlice';
import {axiosRequest} from '../utils/ApiRequest';
import Constant from '../utils/Constant';
import Url from '../utils/Url';
import {showMessage} from 'react-native-flash-message';
import Geolocation from '@react-native-community/geolocation';
import {findCoordinates, getDistanceFromLatLonInMeter} from '../utils/Helper';
import DeviceInfo from 'react-native-device-info';
import {fetchSideBarMenu} from '../redux/slices/sideMenuSlice';

const LoginSchema = Yup.object().shape({
  User_Email_Id: Yup.string().required('User Id is required'),
  Password: Yup.string().required('Password is required'),
});

const Login: React.FC = () => {
  const navigation: any = useNavigation();
  // const dispatch = useDispatch();
  // const { response, userData, loading, loginTime } = useSelector((state: RootState) => state.user);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isWithinRadius, setIsWithinRadius] = useState<any>(false);
  const width = Dimensions.get('screen').width;
  const [state, setValueState] = useState({
    typing_email: false,
    typing_password: false,
    animation_login: new Animated.Value(width - 40),
    enable: true,
  });
  const [appVersion, setAppVersion] = useState('');
  // console.log(userData,loginTime);

  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state?.user);

  useEffect(() => {
    const version = DeviceInfo.getVersion();
    setAppVersion(version);
    if (user?.userInfo) {
      checkGPSStatus();
    }
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      getGeofence();
    }, [dispatch]),
  );
  const checkGPSStatus = async () => {
    setLoading(true);

    try {
      // const withinRadius = await getGeofence();

      // if (!withinRadius?.length) {
      //   Alert.alert('You are not inside the office location.');
      //   dispatch(clearUser());
      //   return;
      // }

      navigation.navigate('MainDrawer', {
        fromLogin: true,
      });
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const getGeofence = async () => {
    if (!user?.userInfo?.geofence) {
      return [];
    }

    return await axiosRequest(
      `http://61.246.33.108:8069/api/geofencesbyid?ids=${user.userInfo?.geofence}`,
      Constant.API_REQUEST_METHOD.GET,
    )
      .then(async ({data}) => {
        if (data) {
          try {
            const coordinates: any = await findCoordinates();

            const currentLat = Number(
              coordinates?.coords?.latitude?.toFixed(6),
            );
            const currentLon = Number(
              coordinates?.coords?.longitude?.toFixed(6),
            );

            const results = data.map(office => {
              const dist = getDistanceFromLatLonInMeter(
                currentLat,
                currentLon,
                office.Latitude,
                office.Longitude,
              );

              return {
                ...office,
                distance: dist,
                isWithinRadius: dist <= office.Radius,
              };
            });

            // Optionally filter to just those within radius
            const withinRadius = results.filter(r => r.isWithinRadius);
            //   const sorted = results.sort((a, b) => a.distance - b.distance);
            setIsWithinRadius(withinRadius);

            return withinRadius;
          } catch (error) {
            console.error('Error getting distance:', error);
            return [];
          }
        } else {
          return [];
        }
      })
      .catch(() => []);
  };

  const handleLogin = async (values: {
    User_Email_Id: string;
    Password: string;
  }) => {
    setLoading(true);

    const payload = {
      userName: values.User_Email_Id,
      loginId: values.User_Email_Id,
      password: values.Password,
    };

    try {
      const {data} = await axiosRequest(
        'https://studentapinew.university99.com/api/user/A01User/login',
        Constant.API_REQUEST_METHOD.POST,
        payload,
      );

      console.log('Login Response =>', data);

      if (data?.isSuccess) {
        const userData = {
          ...data.data.user,

          // JWT token
          token: data.data.token,

          // compatibility with old code
          geofence: data.data.user.geofences_id,
          apkversion: data.data.user.apkVersion,
        };
        console.log(data);
        dispatch(setUser(userData));
        dispatch(setMenus(data?.data?.menus));
      } else {
        setLoading(false);
        Alert.alert(
          'Login Failed',
          data?.message || 'Invalid username or password',
        );
      }
    } catch (error: any) {
      setLoading(false);

      console.log('Login Error =>', error);

      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Something went wrong',
      );
    }
  };
  function foucus(value: any) {
    if (value == 'email') {
      setValueState(prev => ({
        ...prev,
        typing_email: true,
        typing_password: false,
      }));
    } else {
      setValueState(prev => ({
        ...prev,
        typing_email: false,
        typing_password: true,
      }));
    }
  }

  return (
    <LinearGradient colors={Colors.colorGradient} style={styles.background}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>{'Login'}</Text>
          <Text style={styles.subtitle}>
            {'Task Management'}({appVersion})
          </Text>

          <Formik
            initialValues={{User_Email_Id: '', Password: ''}}
            onSubmit={handleLogin}
            validationSchema={LoginSchema}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
            }) => (
              <Animated.View style={styles.formContainer}>
                <View style={styles.noticeContainer}>
                  <Text style={styles.noticeText}>
                    📢 Last Date of Online ITI Admission is
                  </Text>
                  <Text style={styles.noticeDate}>16 June 2026</Text>
                </View>

                <Text style={styles.loginTitle}>Login</Text>

                <Text style={styles.loginSubtitle}>
                  Enter your email ID or mobile no.
                </Text>

                <Text style={styles.label}>Email ID or Mobile No</Text>

                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.inputField}
                    value={values.User_Email_Id}
                    onChangeText={handleChange('User_Email_Id')}
                    onBlur={handleBlur('User_Email_Id')}
                    placeholder="Email ID or Mobile No"
                    placeholderTextColor="#999"
                  />

                  {values.User_Email_Id?.length > 0 && (
                    <Ionicons
                      name="checkmark-circle"
                      size={30}
                      color="#16A34A"
                    />
                  )}
                </View>

                {touched.User_Email_Id && errors.User_Email_Id && (
                  <Text style={styles.errorText}>{errors.User_Email_Id}</Text>
                )}

                <Text style={styles.label}>Password</Text>

                <View style={styles.inputBox}>
                  <TextInput
                    style={styles.inputField}
                    value={values.Password}
                    secureTextEntry={!showPassword}
                    onChangeText={handleChange('Password')}
                    onBlur={handleBlur('Password')}
                    placeholder="Password"
                    placeholderTextColor="#999"
                  />

                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={28}
                      color="#888"
                    />
                  </TouchableOpacity>
                </View>

                {touched.Password && errors.Password && (
                  <Text style={styles.errorText}>{errors.Password}</Text>
                )}

                <View style={styles.optionsRow}>
                  <TouchableOpacity style={styles.rememberRow}>
                    <Ionicons name="checkbox" size={24} color="#6D28D9" />
                    <Text style={styles.rememberText}>Keep me logged in</Text>
                  </TouchableOpacity>

                  <TouchableOpacity>
                    <Text style={styles.forgotText}>Forgot Password?</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.signInButton}
                  disabled={loading}
                  onPress={() => handleSubmit()}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.signInText}>Sign In</Text>
                  )}
                </TouchableOpacity>

                <View style={styles.orContainer}>
                  <View style={styles.line} />
                  <Text style={styles.orText}>OR</Text>
                  <View style={styles.line} />
                </View>

                <TouchableOpacity style={styles.googleButton}>
                  <Ionicons name="logo-google" size={24} color="#DB4437" />
                  <Text style={styles.googleText}>Sign in with Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.registerCard}
                  onPress={() => {
                    navigation.navigate('StudentRegistration');
                  }}>
                  <View>
                    <Text style={styles.registerTitle}>
                      New Admission User?
                    </Text>

                    <Text style={styles.registerLink}>Register Here.</Text>
                  </View>

                  <Ionicons name="arrow-forward" size={28} color="#6D28D9" />
                </TouchableOpacity>
              </Animated.View>
            )}
          </Formik>
        </View>
      </ScrollView>
      <View style={{alignSelf: 'center', paddingVertical: 5}}>
        <Text style={{color: '#000', fontSize: 12, fontWeight: '700'}}>
          App Version: {appVersion}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  loginButtonGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  inputContainer: {
    width: '80%',
  },
  overlay: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    width: '100%',
    minHeight: '100%',
    backgroundColor: 'rgba(255,255,255,0.99)',
    paddingVertical: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  input: {
    color: '#000',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    borderRadius: 25,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 15,
    elevation: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    backgroundColor: '#fff',
    marginBottom: 15,
    elevation: 10,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#000',
  },
  eyeIcon: {
    padding: 15,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: Colors.grad1,
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
    shadowColor: Colors.grad1,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logo: {
    width: 150,
    height: 120,
    alignSelf: 'center',
    marginVertical: 10,
    resizeMode: 'contain',
  },
  animation: {
    backgroundColor: '#93278f',
    paddingVertical: 10,
    marginTop: 30,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topImageContainer: {width: '100%', position: 'absolute', top: 0},
  topImage: {
    width: '100%',
    height: 150,
  },
  leftVectorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    zIndex: 0,
    borderTopRightRadius: 25,
    width: 50,
  },

  leftVectorImage: {
    height: 250,
    width: 150,
  },
  formContainer: {
    width: '90%',
  },

  noticeContainer: {
    backgroundColor: '#EF0000',
    borderRadius: 10,
    padding: 18,
    marginBottom: 25,
  },

  noticeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },

  noticeDate: {
    color: '#FFFF00',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },

  loginTitle: {
    fontSize: 42,
    fontWeight: '700',
    color: '#002B5B',
  },

  loginSubtitle: {
    color: '#64748B',
    fontSize: 18,
    marginBottom: 20,
  },

  label: {
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
  },

  inputBox: {
    borderWidth: 1,
    borderColor: '#D6DCE5',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 65,
    marginBottom: 12,
  },

  inputField: {
    flex: 1,
    color: '#000',
    fontSize: 18,
  },

  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 15,
  },

  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  rememberText: {
    marginLeft: 8,
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },

  forgotText: {
    color: '#5B2EFF',
    fontWeight: '700',
  },

  signInButton: {
    backgroundColor: '#6D28D9',
    borderRadius: 10,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  signInText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },

  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 25,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },

  orText: {
    marginHorizontal: 15,
    fontWeight: '700',
    color: '#64748B',
  },

  googleButton: {
    borderWidth: 1,
    borderColor: '#D6DCE5',
    borderRadius: 10,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  googleText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#111827',
  },

  registerCard: {
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#F5C266',
    backgroundColor: '#FFF8E8',
    borderRadius: 10,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  registerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },

  registerLink: {
    color: '#5B2EFF',
    fontWeight: '700',
    marginTop: 4,
  },
});

export default Login;
