import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Image,
} from 'react-native';
import { Camera, useCameraDevice, useCameraDevices } from 'react-native-vision-camera';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { findCoordinates } from '../utils/Helper';
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


const AttendanceScreen = () => {
  const [currentTime, setCurrentTime] = useState(moment().format('hh : mm : ss A'));
  const [hasPermission, setHasPermission] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'Home' | 'Office'>('Home');
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [cameraPosition, setCameraPosition] = useState<"back" | "front">("front");
  const device = useCameraDevice(cameraPosition)
  const isCameraReady = hasPermission && device;
  const navigation = useNavigation()
   const [loading, setLoading] = useState(false);
     const [capturedImage, setCapturedImage] = useState<string | null>(null);
   const user = useSelector((state: RootState) => state?.user);


  const cameraRef = useRef<Camera>(null);


  const [ipAddress, setIpAddress] = useState<string | null>(null);

  useEffect(() => {
    const fetchIPAddress = async () => {
      const state = await NetInfo.fetch();
      console.log('Network Info:', state);
      setIpAddress(state.details?.ipAddress || null);
    };

    fetchIPAddress();
    console.log(user);
    
  }, []);

    const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await DeviceInfo.getUniqueId(); 
      setDeviceId(id);
    };

    fetchDeviceId();
  }, []);



  useEffect(() => {
    const getPermissions = async () => {

      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'granted');
      console.log("permiss", status);
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

  const handleConfirmPhoto = () => {
    console.log("Photo confirmed:", photoPath);
    navigation.goBack()
    // TODO: Upload/save photo
    setPhotoPath(null);
  };


  const takePhoto = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePhoto({
        flash: 'off',
      });
      setPhotoPath(photo.path);

      console.log('Photo taken:', photo.path);
    }
  };
    const capturePhoto = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePhoto({
          flash: 'off',
        });
        setPhotoPath(photo.path);
        const compressedUri = await ImageCompresser.compress(`file://${photo.path}`);
        const base64 = await RNFS.readFile(compressedUri, 'base64');
        setCapturedImage(base64);
      } catch (error) {
        console.error("Capture error:", error);
      }
    }
  };
    const addcapturePhoto = async () => {
    setLoading(true);
    
    findCoordinates().then(async (coordinates: any) => {
      const { coords } = coordinates;

      const param = {
  "data":  `data:image/png;base64,${capturedImage}`,
  "Lalitude": coords?.latitude.toString(),
  "Laungitude":  coords?.longitude.toString(),
  "PUNCH": "IN",
  "uid": user?.userInfo?.AgentId,
  "ip": deviceId,
  "email": "test@example.com",
  "TimeScheduleId": 1
}
console.log(param);
navigation.goBack()
    setPhotoPath(null);


      await axiosRequest(Url.savecapture, Constant.API_REQUEST_METHOD.POST, param)
        .then(({ data }) => {
          console.log(data);
          
          if (data) {
            showMessage({ message: data?.message, type: 'success' });
            navigation.goBack();
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
      {isCameraReady ? <>
        <View style={styles.tabWrapper}>

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
              </View>
            </>
          ) : isCameraReady && (
            <View style={{ width: 250, height: 400, borderRadius: 10, overflow: 'hidden' }}>
              <Camera
                ref={cameraRef}
                style={{ flex: 1 }}
                device={device}
                isActive={true}
                photo={true}              />
            </View>
          )}
        </View>



        {/* Check In Section */}
        {/* <View style={styles.checkInContainer}>
          <Text style={styles.timeText}>{currentTime}</Text>
          <TouchableOpacity style={styles.checkInButton} onPress={takePhoto}>
            <Text style={styles.checkInText}>Check In</Text>
          </TouchableOpacity>
        </View> */}

        <View style={styles.card}>
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
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.icon}>⏰</Text>
            <Text style={styles.detailText}>Today Shift : 08:00 - 17:00</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.icon}>📍</Text>
            <Text style={styles.detailText}>
              Location : <Text style={styles.bold}>Head Office (Jakarta)</Text>
            </Text>
          </View>

          <TouchableOpacity style={styles.button} onPress={capturePhoto}>
            <Text style={styles.buttonText}>Clock In</Text>
          </TouchableOpacity>
        </View>
      </> :
        (
          <Text>Loading camera...</Text>
        )
      }
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
    padding: 10,
    borderRadius: 30,
  },
  controlIcon: {
    fontSize: 20,
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
  cancelButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 30,
    marginHorizontal: 10,
  },

  card: {
    backgroundColor: '#F8F9FB',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
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
function addOfflinePic(param: { data: string; Lalitude: string; Laungitude: string; PUNCH: string; uid: number; ip: string; email: string; TimeScheduleId: number; }) {
  throw new Error('Function not implemented.');
}

