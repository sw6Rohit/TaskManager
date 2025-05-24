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


const AttendanceScreen = () => {
  const [currentTime, setCurrentTime] = useState(moment().format('hh : mm : ss A'));
  const [hasPermission, setHasPermission] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'Home' | 'Office'>('Home');
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [cameraPosition, setCameraPosition] = useState<"back" | "front">("front");
  const device = useCameraDevice(cameraPosition)
  const isCameraReady = hasPermission && device;



  const cameraRef = useRef<Camera>(null);


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

  return (
    <SafeAreaView style={styles.container}>
      {/* Tabs */}
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
              <TouchableOpacity style={styles.okButton} onPress={handleConfirmPhoto}>
                <Text style={styles.controlIcon}>✔ OK</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : isCameraReady ? (
          <Camera
            ref={cameraRef}
            style={styles.camera}
            device={device}
            isActive={true}
            photo={true}
          />
        ) : (
          <Text>Loading camera...</Text>
        )}
      </View>



      {/* Check In Section */}
      <View style={styles.checkInContainer}>
        <Text style={styles.timeText}>{currentTime}</Text>
        <TouchableOpacity style={styles.checkInButton} onPress={takePhoto}>
          <Text style={styles.checkInText}>Check In</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <MaterialCommunityIcons
            name="clock-time-three"
            size={20}
            color={'#333'}
          />
          <Text style={styles.statTitle}>10:00 AM</Text>
          <Text>Check In</Text>
        </View>
        <View style={styles.statBox}>
          <MaterialCommunityIcons
            name="clock-time-three"
            size={20}
            color={'#333'}
          />
          <Text style={styles.statTitle}>06:30 PM</Text>
          <Text>Check Out</Text>
        </View>
        <View style={styles.statBox}>
          <MaterialCommunityIcons
            name="clock-time-three"
            size={20}
            color={'#333'}
          />
          <Text style={styles.statTitle}>08:00</Text>
          <Text>Working HR’s</Text>
        </View>
      </View>
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

});
