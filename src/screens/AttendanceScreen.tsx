import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from 'react-native';

const AttendanceScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      
      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={styles.tabText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>Office</Text>
        </TouchableOpacity>
      </View>

      {/* Camera / Face Recognition */}
      <View style={styles.cameraContainer}>
        <Image
          source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
          style={styles.faceImage}
        />
        <View style={styles.cameraControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlIcon}>◀</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.captureButton}>
            <Text style={styles.controlIcon}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlIcon}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Check In Time */}
      <View style={styles.checkInContainer}>
        <Text style={styles.timeText}>09 : 50 : 22 AM</Text>
        <TouchableOpacity style={styles.checkInButton}>
          <Text style={styles.checkInText}>Check In</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statTitle}>10:00 AM</Text>
          <Text>Check In</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statTitle}>06:30 PM</Text>
          <Text>Check Out</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statTitle}>08:00</Text>
          <Text>Working HR’s</Text>
        </View>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderBottomWidth: 2,
    borderColor: '#ccc',
  },
  activeTab: {
    borderColor: '#0078D4',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cameraContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  faceImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cameraControls: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
  },
  controlButton: {
    marginHorizontal: 20,
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
    borderRadius: 10,
  },
  checkInText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  statBox: {
    alignItems: 'center',
  },
  statTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#0078D4',
  },
});

export default AttendanceScreen;
