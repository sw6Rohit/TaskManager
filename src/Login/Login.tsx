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
} from 'react-native';

import {Formik} from 'formik';
import * as Yup from 'yup';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../utils/Colors';
import LinearGradient from 'react-native-linear-gradient';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {RootState} from '../redux/store';
import {setUser} from '../redux/slices/userSlice';
import {axiosRequest} from '../utils/ApiRequest';
import Constant from '../utils/Constant';
import Url from '../utils/Url';
import {showMessage} from 'react-native-flash-message';
import Geolocation from '@react-native-community/geolocation';
import {findCoordinates, getDistanceFromLatLonInMeter} from '../utils/Helper';
import DeviceInfo from 'react-native-device-info';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Mobile No is required'),
  password: Yup.string().required('Password is required'),
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
    checkGPSStatus();
  }, [user]);

  useFocusEffect(
    React.useCallback(() => {
      getGeofence();
    }, [dispatch]),
  );

  const checkGPSStatus = async () => {
    if (Platform.OS === 'android') {
      // if (user?.userInfo) navigation.navigate('DashBoard', {fromLogin: true});
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Permission Required',
          message: 'This app needs to access your location to proceed.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert('Permission Denied', 'Location permission is required.');
        return;
      }
    }

    Geolocation.getCurrentPosition(
      position => {
        // console.log('GPS is ON', isWithinRadius);
        if (isWithinRadius && !isWithinRadius[0]?.isWithinRadius) {
          // showMessage({ message: 'You are not inside the office location.', type: 'danger' });
          Alert.alert('You are not inside the office location.');
          setLoading(false);
        }
        // else

        if (user?.userInfo && position) {
          if (user?.userInfo?.apkversion != DeviceInfo.getVersion()) {
            Alert.alert(
              'Update Required',
              'You are using' +
                DeviceInfo.getVersion() +
                'But currently running' +
                user?.userInfo?.apkversion +
                'Please install the latest version of the app to continue.',
              [
                {
                  text: 'OK',
                  onPress: () => Linking.openURL('https://appho.st/d/KIwfhe1v'), // Replace with your actual update link
                },
              ],
              {cancelable: true},
            );
          } else {
            setLoading(false);
            showMessage({message: 'Login Successfully', type: 'success'});
            navigation.navigate('DashBoard', {fromLogin: true});
          }
        }
      },
      error => {
        setLoading(false);
        console.log('GPS Error:', error);
        if (error.code === 2) {
          Alert.alert(
            'GPS is Off',
            'Please enable GPS to continue.',
            [
              {
                text: 'Open Settings',
                onPress: () => {
                  Linking.openSettings(); // Takes user to app settings
                },
              },
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ],
            {cancelable: false},
          );
        } else if (error.code === 3) {
          // Alert.alert('Location Timeout', 'Unable to get your location in time. Try again.');
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 1000,
      },
    );
  };

  const getGeofence = async () => {
    await axiosRequest(
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
          }
        } else {
        }
      })
      .catch(() => {});
  };

  const handleLogin = async (values: {username: string; password: string}) => {
    const param = {
      ...values,
    };
    setLoading(true);
    await axiosRequest(
      `http://webapi.prdkvmic.org.in/api${Url.LOGIN}`,
      Constant.API_REQUEST_METHOD.POST,
      param,
    )
      .then(async ({data}) => {
        dispatch(setUser({token: data?.token}));
        if (data) {
          await axiosRequest(
            `http://webapi.prdkvmic.org.in/api/master/UserProfile/get`,
            Constant.API_REQUEST_METHOD.GET,
          ).then(UserProfile => {
            const newUser = UserProfile?.data?.data[0];
            console.log(newUser);

            const mappedUser = {
              AgentId: newUser.UserId,
              AgentName: `${newUser.firstname} ${newUser.lastname}`,
              Personal_Mobile: newUser.mobileno1,
              Email_id_Offical: newUser.email,
              department: newUser.department,
              designation: newUser.designation,
              dateofjoining: newUser.dateofjoining,
              companyname: newUser.EmployeeCompanyName,
              branch: newUser.BranchName,
              apkversion: newUser.apkversion,
              UserType: newUser.UserType,
              image: newUser.image,
              CompanyName: newUser.CompanyName,
              CompanyShortName: newUser.CompanyShortName,

              // Keep rest default (from previous JSON)
              user: null,
              userList: null,
              id: 0,
              tmsstatus: 0,
              blockdays: 0,
              AgentCode: null,
              blockreason: null,
              geofence: '1,2,3,4,5,6,7,8',
              Agent_Short_Name: null,
              TeamLeadName: null,
              Role_id: data?.roleId,
              Password: null,
              officeemail: null,
              Offical_Mobile: null,
              otherphone: null,
              userstatus: 0,
              max_leads: 0,
              status: false,
              archive: false,
              collegeid: 0,
              campaign: null,
              subcampaign: null,
              islocked: 0,
              FollowUpTimeLimit: 0,
              punchid: 0,
              isallcampaign: 0,
              isallsubcampaign: 0,
              isallowedforpool: 0,
              leadcount: 0,
              noOfhours: 0,
              starttime: null,
              endtime: null,
              isallowedforoutlogin: 0,
              priority: 0,
              bucketSize: 0,
              max_bucket_Size: 0,
              ipaddress: null,
              speeddialid: null,
              LevelID: 0,
              ParentID: 27,
              SalesPipeLineid: 0,
              IdealTimeOut: 0,
              defaultAppId: 0,
              syncDate: '0001-01-01T00:00:00',
              syncStatus: null,
              islockedStatus: null,
              Token: null,
              UserName: null,
              UserNameDept: null,
              TaskOption: 101,
              dailylimit: 250,
              TotalPendingTask: 10,
              role: null,
              homephone: null,
              mobileno: null,
              CompletionLimit: 0,
              MaxPendingLimit: 0,
              employeecode: null,
              countryname: null,
              isactive: 0,
              typeofemp: 0,
              rollid: 0,
              leavetypeid: 0,
              jobbranch: 0,
              TeamLeadId: 0,
              gender: null,
              dateofbirth: '0001-01-01T00:00:00',
              dateofanniversary: '0001-01-01T00:00:00',
              Project: 0,
            };

            dispatch(setUser(mappedUser));
          });
          // setLoading(false);
          // navigation.navigate('DashBoard', {});
        } else {
          showMessage({message: 'Something went wrong', type: 'danger'});
          setLoading(false);
        }
      })
      .catch(() => {
        setLoading(false);
      });
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
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* <Animated.Text entering={FadeInDown.duration(1000)} style={styles.title}>
                        Samvad
                    </Animated.Text> */}
          <View style={styles.topImageContainer}>
            {/* <Image
                            source={require("./assets/login_header.png")}
                            style={styles.topImage}
                        /> */}
          </View>
          {/* <Animated.Image
                        source={Images.LOGO} // Change to your image path
                        style={styles.logo}
                    /> */}

          <Text style={styles.title}>{'Login'}</Text>
          <Text style={styles.subtitle}>{'Task Management'}</Text>

          <Formik
            initialValues={{User_Email_Id: '', password: ''}}
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
              <Animated.View style={styles.inputContainer}>
                <TextInput
                  placeholder="Please enter Email Id/ mobile no"
                  style={styles.input}
                  value={values.username}
                  onChangeText={handleChange('username')}
                  onBlur={handleBlur('username')}
                  placeholderTextColor="#ccc"
                />
                {touched.username && errors.username && (
                  <Text style={styles.errorText}>{errors.username}</Text>
                )}

                {/* Password Input with Eye Icon */}
                <View style={styles.passwordContainer}>
                  <TextInput
                    placeholder="Please input password"
                    style={styles.passwordInput}
                    value={values.password}
                    secureTextEntry={!showPassword}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    placeholderTextColor="#ccc"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}>
                    <Ionicons
                      name={showPassword ? 'eye-off' : 'eye'}
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                {touched.Password && errors.Password && (
                  <Text style={styles.errorText}>{errors.Password}</Text>
                )}

                {/* Login Button */}
                <TouchableOpacity
                  style={styles.loginButton}
                  onPress={() => handleSubmit()}>
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.loginButtonText}>{'Login'}</Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}
          </Formik>
        </View>
      </View>
      <View style={{position: 'absolute', bottom: 20, alignSelf: 'center'}}>
        <Text style={{color: '#000', fontSize: 12}}>
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
    // backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.99)',
    // padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
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
});

export default Login;
