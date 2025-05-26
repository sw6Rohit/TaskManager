import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { axiosRequest } from '../utils/ApiRequest';
import Url from '../utils/Url';
import Constant from '../utils/Constant';






export default function DashboardSummary() {
  const navigation = useNavigation();
      useEffect(() => {
          getProjectList();
      }, [])
      const getProjectList = async () => {
          try {
              const param = {
                  "UserId": -1,
                  "TaskId": -1
              };
              await axiosRequest(Url.GET_PROJECTLIST, Constant.API_REQUEST_METHOD.POST, param)
                  .then(({ data }) => {
                      const { userList } = data;
                      // setAgents(userList)
                      console.log(userList);
                  })
          } catch (error) {
              console.log(error);
          }
      }

  const AttendanceRow = ({ date, day, inTime, outTime, total, location }) => (
    <View style={styles.attendanceRow}>
      {/* Date Box */}
      <View style={styles.dateBox}>
        <Text style={styles.dateDay}>{date}</Text>
        <Text style={styles.dateText}>{day}</Text>
      </View>

      {/* Row-wise Cards */}
      <View style={{ flex: 1 }}>
        <View style={styles.timeCardsContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("AttendanceScreen")}
            style={styles.timeCard}>
            <Text style={styles.timeLabel}>Check In</Text>
            <Text style={styles.timeValue}>{inTime}</Text>
          </TouchableOpacity>
          <View style={styles.timeCard}>
            <Text style={styles.timeLabel}>Check Out</Text>
            <Text style={styles.timeValue}>{outTime}</Text>
          </View>
          <View style={styles.timeCard}>
            <Text style={styles.timeLabel}>Total</Text>
            <Text style={styles.timeValue}>{total}</Text>
          </View>

        </View>
        <View style={styles.locationRow}>
          <Icon name="location-on" size={16} color="#4caf50" />
          <Text style={styles.locationText}>{location}</Text>
        </View>
      </View>
    </View>
  );
  const AttendanceStatCard = ({ label, count, color, bgColor }) => (
    <View style={[styles.card2, { borderTopColor: color, backgroundColor: bgColor }]}>
      <Text style={[styles.label, { color }]}>{label}</Text>
      <Text style={[styles.count, { color }]}>{count}</Text>
    </View>
  );


  const SummaryCard = ({ label, count, color }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("TaskSummary")}
      style={[styles.card, { backgroundColor: color }]}>
      <Text style={styles.cardCount}>{count}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
      <Icon name="more-horiz" size={20} color="#fff" style={styles.cardIcon} />
    </TouchableOpacity>
  );
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Dashboard</Text>
      <Text style={styles.subHeader}>Project Summary</Text>

      {/* Project Summary Cards */}
      <View style={styles.summaryGrid}>
        <SummaryCard label="In Progress" count="24" color="#7E57C2" />
        <SummaryCard label="In Review" count="56" color="#AB47BC" />
        <SummaryCard label="On Hold" count="16" color="#FFB300" />
        <SummaryCard label="Completed" count="45" color="#66BB6A" />
      </View>

      <Text style={styles.subHeader}>Attendance History</Text>
      <View style={[styles.card,{width: '100%'}]}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>Today's Attendance</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.date}>Monday, 21 Jan 2023</Text>

      </View>

      {/* Attendance History */}

      <View style={styles.attendanceContainer}>
        <AttendanceStatCard label="Present" count="13" color="#4CAF50" bgColor="#E8F5E9" />
        <AttendanceStatCard label="Absents" count="02" color="#F44336" bgColor="#FFEBEE" />
        <AttendanceStatCard label="Late in" count="04" color="#FF9800" bgColor="#FFF3E0" />
      </View>


      <TouchableOpacity style={styles.requestBtn}  onPress={()=>navigation.navigate('AttendanceScreen')}>
        <Text style={styles.requestText}>+ Attendance</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.requestBtn}  onPress={()=>navigation.navigate('DashBoardC')}>
        <Text style={styles.requestText}>+ Task</Text>
      </TouchableOpacity>
      {/* <AttendanceRow
        date="22"
        day="Wed"
        inTime="07:57"
        outTime="17:00"
        total="08:03"
        location="Office, West Jakarta, Indonesia"
      /> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  subHeader: { fontSize: 18, fontWeight: '600', marginVertical: 10 },

  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    position: 'relative',
  },
     card2: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 10,
    borderTopWidth: 4,
    alignItems: 'center',
  },
  cardCount: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  cardLabel: { fontSize: 16, color: '#fff', marginTop: 5 },
  cardIcon: { position: 'absolute', top: 10, right: 10 },

  attendanceDetails: { flex: 1 },
  attendanceRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    alignItems: 'center',
  },
  dateBox: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#E0F2F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateDay: { fontSize: 18, fontWeight: 'bold' },
  dateText: { fontSize: 14, color: '#555' },

  timeCardsContainer: { flex: 1, flexDirection: 'row', },
  timeCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    elevation: 1,
    flex: 1,
    marginHorizontal: 5,

  },
  timeLabel: { fontSize: 13, color: '#777', textAlign: 'center' },
  timeValue: { fontSize: 16, fontWeight: '600', marginTop: 2, textAlign: 'center' },

  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  locationText: { marginLeft: 4, color: '#555', flexShrink: 1 },
  requestBtn: {
    margin: 16,
    borderWidth: 1,
    borderColor: '#1D5DFF',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
  },
  requestText: {
    color: '#1D5DFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  seeAll: {
    fontSize: 13,
    color: '#1D5DFF',
    fontWeight: '600',
  },
  date: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  count: {
    fontSize: 20,
    fontWeight: 'bold',
  },
    attendanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginVertical: 15,
  },
});
