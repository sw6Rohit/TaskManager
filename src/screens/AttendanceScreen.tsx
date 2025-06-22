import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, useCameraDevices } from 'react-native-vision-camera';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { findCoordinates, getAddressFromLatLng, getDistanceFromLatLonInMeter } from '../utils/Helper';
import { useNavigation } from '@react-navigation/native';
import { axiosRequest } from '../utils/ApiRequest';
import Url from '../utils/Url';
import Constant from '../utils/Constant';
import { showMessage } from 'react-native-flash-message';
import RNFS from 'react-native-fs';
import { Image as ImageCompresser } from 'react-native-compressor';
import NetInfo from '@react-native-community/netinfo';

import DeviceInfo from 'react-native-device-info';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import BackButton from '../components/BackButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeModules } from 'react-native';
import Share from 'react-native-share';
import CustomSuccessAlert from '../components/CustomSuccessAlert';

const { TimestampImage } = NativeModules;


const AttendanceScreen = () => {
  const [currentTime, setCurrentTime] = useState(moment().format('hh : mm : ss A'));
  const [hasPermission, setHasPermission] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'Home' | 'Office'>('Home');
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [currentLocation, setcurrentLocation] = useState<string | null>('');
  const [officeLocation, setOfficeAddress] = useState<string | null>('');
  const [officeLatLong, setOfficeLatLong] = useState<any | null>([]);
  const [latLong, setLatLong] = useState<any | null>('');
  const [distance, setDistance] = useState<any | null>('');
  const [shareButton, setShareButton] = useState<any>(false);
  const [cameraPosition, setCameraPosition] = useState<"back" | "front">("front");
  const device = useCameraDevice(cameraPosition)
  const isCameraReady = hasPermission && device;
  const navigation = useNavigation()
  const [loading, setLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state?.user);
  const insets = useSafeAreaInsets();


  const cameraRef = useRef<Camera>(null);


  const [ipAddress, setIpAddress] = useState<string | null>(null);

  useEffect(() => {
    console.log(user);
    const fetchIPAddress = async () => {
      const state = await NetInfo.fetch();
      setIpAddress(state.details?.ipAddress || null);
    };

    fetchIPAddress();
    getGeofence();
  }, []);

  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await DeviceInfo.getUniqueId();
      setDeviceId(id);
    };

    getDistancefromOffice();
    getCurrentLocation();
    fetchDeviceId();
  }, [officeLatLong]);



  useEffect(() => {
    const getPermissions = async () => {

      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
    };
    getPermissions();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment().format('hh : mm : ss A'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  const handleCancelPhoto = () => {
    setPhotoPath(null); // Discard photo
  };

  const getCurrentLocation = (() => {
    findCoordinates().then(async (coordinates: any) => {
      const { coords } = coordinates;
      const { fullAddress } = await getAddressFromLatLng(coords?.latitude, coords?.longitude);
      const fullAddressOffice = await getAddressFromLatLng(officeLatLong[0]?.Latitude, officeLatLong[0]?.Longitude);
      setOfficeAddress(fullAddressOffice?.fullAddress)
      setcurrentLocation(fullAddress)
      setLatLong(coords)


    });
  })
  const getGeofence = async () => {
    await axiosRequest(`http://61.246.33.108:8069/api/geofencesbyid?ids=${user.userInfo?.geofence}`, Constant.API_REQUEST_METHOD.GET)
      .then(({ data }) => {
        if (data) {
          setOfficeLatLong(data)
        } else {
        }
      })
      .catch(() => {
      });
  }

  const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
        });
        // setPhotoPath(photo.path);
        const compressedUri = await ImageCompresser.compress(`file://${photo.path}`);
        const base64 = await RNFS.readFile(compressedUri, 'base64');
        TimestampImage.addTimestamp(
          photo.path,
          latLong?.latitude,
          latLong?.longitude,
          currentLocation,
          officeLocation
        ).then((newImagePath: any) => {
          setPhotoPath(newImagePath);

          console.log('Saved image at:', newImagePath);
        }).catch((error) => {
          console.error('Error adding timestamp:', error);
        });
        setCapturedImage(base64);
      } catch (error) {
        console.error("Capture error:", error);
      }
    }
  };
  const addcapturePhoto = async () => {
    setLoading(true);
    console.log(distance[0]?.isWithinRadius);

   if (distance[0]?.isWithinRadius) {
  Alert.alert(
    "Location Alert",
    `Please mark your attendance inside the office.\nYou are currently ${distance[0]?.distance?.toFixed(2)} meter away.`,
    [
      {
        text: "OK",
        onPress: () => navigation.goBack(), // Navigate back when OK is pressed
      },
    ],
    { cancelable: false }
  );
  return;
}


    findCoordinates().then(async (coordinates: any) => {
      const { coords } = coordinates;

      const param = {
        "data": `data:image/png;base64,${capturedImage}`,
        "Lalitude": coords?.latitude.toString(),
        "Laungitude": coords?.longitude.toString(),
        "PUNCH": "IN",
        "uid": user?.userInfo?.AgentId,
        "ip": "192.168.1.50",
        "email": user?.userInfo?.Email_id_Offical ? user?.userInfo?.Email_id_Offical : " ",
        "TimeScheduleId": 1,
        "apkversion":user?.userInfo?.apkversion
      }
      // console.log(param);



      await axiosRequest('http://61.246.33.108:8069/savecapture', Constant.API_REQUEST_METHOD.POST, param)
        .then(({ data }) => {
          console.log(data);

          if (data) {
            setShareButton(true)
            // showMessage({ message: "Attendance marked Successfully", type: 'success' });
            // Alert.alert("Attendance marked Successfully")
            // navigation.goBack();
          } else {
            showMessage({ message: data?.message, type: 'danger' });
            // addOfflinePic(param);
          }
        })
        .catch(() => {
          // addOfflinePic(param);
        });
    });
  };

  const getDistancefromOffice = async () => {

    try {
      const coordinates: any = await findCoordinates();

      const currentLat = Number(coordinates?.coords?.latitude?.toFixed(6));
      const currentLon = Number(coordinates?.coords?.longitude?.toFixed(6));

      const results = officeLatLong.map((office) => {
        const dist = getDistanceFromLatLonInMeter(
          currentLat,
          currentLon,
          office.Latitude,
          office.Longitude
        );

        return {
          ...office,
          distance: dist,
          isWithinRadius: dist <= office.Radius,
        };
      });


      // Optionally filter to just those within radius
      const withinRadius = results.filter((r) => r.isWithinRadius);
      const sorted = results.sort((a, b) => a.distance - b.distance);
      setDistance(sorted)

      return withinRadius;
    } catch (error) {
      console.error('Error getting distance:', error);
    }
  };





  const shareOnWhatsApp = async () => {
    if (!photoPath) {
      Alert.alert("No image to share");
      return;
    }

    try {
      const shareOptions = {
        url: `file://${photoPath}`,
        social: Share.Social.WHATSAPP,
        failOnCancel: false,
      };
      await Share.shareSingle(shareOptions);
      setPhotoPath(null);
    } catch (error) {
      console.error('Error sharing image:', error);
      Alert.alert('Error', 'Could not share image.');
    }
  };

  return (
    <SafeAreaView style={[styles.container,]}>
      {isCameraReady ? (
        <>
          <View>
            <Text style={styles.welcomeText}>Welcome, {user?.userInfo?.AgentName || 'Guest'}</Text>
          </View>
          <BackButton />

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            {/* Tabs */}
            {/*  <View style={styles.tabWrapper}>
              <View style={styles.tabBackground}>
                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    { flexDirection: 'row' },
                    selectedTab === 'Home' && styles.activeTabButton,
                  ]}
                  onPress={() => setSelectedTab('Home')}
                >
                  <MaterialCommunityIcons
                    name="home-outline"
                    size={20}
                    color={selectedTab === 'Home' ? '#fff' : '#333'}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      selectedTab === 'Home' && styles.activeTabText,
                    ]}
                  >
                    Home
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tabButton,
                    { flexDirection: 'row' },
                    selectedTab === 'Office' && styles.activeTabButton,
                  ]}
                  onPress={() => setSelectedTab('Office')}
                >
                  <MaterialCommunityIcons
                    name="office-building-outline"
                    size={20}
                    color={selectedTab === 'Office' ? '#fff' : '#333'}
                  />
                  <Text
                    style={[
                      styles.tabText,
                      selectedTab === 'Office' && styles.activeTabText,
                    ]}
                  >
                    Office
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
 */}
            {/* Camera View */}
            <View style={styles.cameraContainer}>
              {photoPath ? (
                <>
                  <Image source={{ uri: 'file://' + photoPath }} style={styles.camera} />
                  <View style={styles.cameraControls}>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPhoto}>
                      <Text style={styles.controlIcon}>✖ Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.okButton} onPress={addcapturePhoto}>
                      <Text style={styles.controlIcon}>✔ OK</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.whatsappButton} onPress={shareOnWhatsApp}>
                         <Text style={styles.controlIcon}>📤 WhatsApp</Text>
                       </TouchableOpacity> */}

                  </View>

                </>
              ) : (
                <>


                  <View style={{ width: 250, height: 360, borderRadius: 10, overflow: 'hidden' }}>
                    <Camera
                      ref={cameraRef}
                      style={{ flex: 1 }}
                      device={device}
                      isActive={true}
                      photo={true}
                    />
                  </View>
                  <TouchableOpacity style={styles.captureButton} onPress={capturePhoto}>
                    <Text style={styles.controlIcon}>📸 {'Mark Attendance'}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Attendance Info Card */}
            <View style={[styles.card, { marginBottom: insets.bottom + 10 }]}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>📖 Attendance</Text>
                  <Text style={styles.time}>{currentTime}</Text>
                  <Text style={styles.date}>{moment().format('llll')}</Text>
                </View>
                <Image
                  source={{ uri: 'https://img.icons8.com/color/96/000000/mountain.png' }}
                  style={styles.image}
                />
                <CustomSuccessAlert
                  shareImageToWhatsApp={shareOnWhatsApp}
                  visible={shareButton}
                  onClose={() => setShareButton(false)}
                  photoPath={photoPath}
                />
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.icon}>⏰</Text>
                <Text style={styles.detailText}>Today Shift : 08:00 - 17:00</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.icon}>📍</Text>
                <Text style={styles.detailText}>
                  Office Location : <Text style={styles.bold}>{officeLocation}</Text>
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.icon}>📍</Text>
                <Text style={styles.detailText}>
                  Your Location : <Text style={styles.bold}>{currentLocation}</Text>
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.icon}>📍</Text>
                <Text style={styles.detailText}>
                  Distance from Office is : <Text style={styles.bold}>{distance[0]?.distance} Meter</Text>
                </Text>
              </View>
            </View>
          </ScrollView>
        </>
      ) : (
        <Text style={{ padding: 20 }}>Loading camera...</Text>
      )}
    </SafeAreaView>
  );
};

export default AttendanceScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#333',
  },
  tabWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5, // for Android
    alignItems: 'center',
  },
  tabBackground: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderRadius: 30,
    padding: 4,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 30,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTabButton: {
    backgroundColor: '#0078D4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  cameraContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  camera: {
    width: 250,
    height: 400,
    borderRadius: 10,
  },
  cameraControls: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    backgroundColor: '#0078D4',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 24,
    marginTop: 15,
    // alignItems: 'center',
  },

  controlIcon: {
    fontSize: 18,
    color: '#fff',
  },
  checkInContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 20,
  },
  timeText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  checkInButton: {
    backgroundColor: '#0078D4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  checkInText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0078D4',
  },
  okButton: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  whatsappButton: {
    backgroundColor: '#25D366',
    padding: 10,
    borderRadius: 30,
    marginHorizontal: 10,
  },

  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 30,
    marginHorizontal: 10,
  },

  card: {
    backgroundColor: '#F8F9FB',
    borderRadius: 16,
    padding: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    width: '90%',
    alignSelf: 'center',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  time: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  date: {
    fontSize: 14,
    color: '#777',
  },
  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#444',
  },
  bold: {
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  button: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

