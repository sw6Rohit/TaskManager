import { useNavigation } from '@react-navigation/native';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { axiosRequest } from '../utils/ApiRequest';
import Url from '../utils/Url';
import Constant from '../utils/Constant';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { setTaskMaster } from '../redux/slices/userSlice';



export default function DashboardSummary() {
  const user = useSelector((state: RootState) => state?.user);
  const taskMaster = useSelector((state: RootState) => state.user.taskMaster);
  const navigation = useNavigation();
  const dispatch=useDispatch();
  useEffect(() => {
    getProjectList();
    getAttendanceList();
  }, [])
  const getProjectList = async () => {
    try {
      const param = {
        "UserId": user?.userInfo?.AgentId,
        "TaskId": -1
      };
      await axiosRequest(Url.GET_PROJECTLIST, Constant.API_REQUEST_METHOD.POST, param)
        .then(({ data }) => {
           dispatch(setTaskMaster(data));
          // console.log(data);
        })
    } catch (error) {
      console.log(error);
    }
  }

  const getAttendanceList = async () => {
    try {
      const currentMonth = moment().month() + 1; // month() is 0-indexed, so add 1
      const currentYear = moment().year();

      const param = {
        UserId: user?.userInfo?.AgentId,
        Month: currentMonth,
        Year: currentYear
      };

      await axiosRequest('http://61.246.33.108:8069/api/attendance/getreport', Constant.API_REQUEST_METHOD.POST, param)
        .then(({ data }) => {
          // console.log(data);
        });
    } catch (error) {
      console.log(error);
    }
  };

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
  const requestData = [
  { id: '1', count: '04', label: 'Leave\nRequest', color: '#3478F6' },
  { id: '2', count: '12', label: 'Claim\nRequest', color: '#22C55E' },
  { id: '3', count: '01', label: 'Other\nRequest', color: '#FB923C' },
];

const RequestCard = ({ count, label, color }: any) => (
  <View style={styles.card1}>
    <View style={[styles.countBox, { backgroundColor: color }]}>
      <Text style={styles.countText}>{count}</Text>
    </View>
    <Text style={styles.labelText}>{label}</Text>
  </View>
);
const cardData = [
  { id: '1', label: 'Attendance', icon: 'calendar-check', color: '#2563EB',nav:'AttendanceHistory' },
  { id: '2', label: 'Track Leave', icon: 'calendar-remove', color: '#DC2626',nav:'StudentList' },
  { id: '3', label: 'Payroll', icon: 'checkbook', color: '#D97706',nav:'' },
];

const IconCard = ({ icon, label, color,nav }: any) => (
  <TouchableOpacity style={[styles.card3, { borderColor: color }]} 
  onPress={() => navigation.navigate(nav)}>
    <MaterialCommunityIcons name={icon} size={30} color={color} />
    <Text style={styles.label3}>{label} </Text>
  </TouchableOpacity>
);
  return (
    <ScrollView style={styles.container}>
      <StatusBar hidden={true} />
      <Text style={styles.welcomeText}>Welcome, {user?.userInfo?.AgentName || 'Guest'}</Text>
      <Text style={styles.header}>Dashboard</Text>
      <View style={styles.attendanceContainer}>
        <AttendanceStatCard label="Present" count="13" color="#4CAF50" bgColor="#E8F5E9" />
        <AttendanceStatCard label="Absents" count="02" color="#F44336" bgColor="#FFEBEE" />
        <AttendanceStatCard label="Late in" count="04" color="#FF9800" bgColor="#FFF3E0" />
      </View>

      <View style={[styles.card, { width: '100%' }]}>
        <View style={styles.headerRow}>
          <View style={{flexDirection:'column'}}>
            <Text style={styles.title}>Today's Attendance</Text>
        <Text style={styles.date}>Monday, 21 Jan 2023</Text>
          </View>
          < View style={{ flexDirection: 'column' }}>

            <TouchableOpacity style={styles.requestBtn} onPress={() => navigation.navigate('AttendanceScreen')}>
              <Text style={styles.requestText}>+ Attendance</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
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
      <View style={styles.headerContainer}>
        <Text style={styles.subHeader}>📋 Task Summary</Text>
        <TouchableOpacity
          style={styles.requestBtn}
          onPress={() => navigation.navigate('DashBoardC')}
        >
          <Text style={styles.requestText}>+ Add Task</Text>
        </TouchableOpacity>
      </View>


      {/* Project Summary Cards */}
      <View style={styles.summaryGrid}>
        <SummaryCard label="All" count="45" color="#66BB6A" />
        <SummaryCard label="In Progress" count="24" color="#7E57C2" />
        <SummaryCard label="DueToday" count="56" color="#AB47BC" />
        <SummaryCard label="OverDue" count="16" color="#FFB300" />
        <SummaryCard label="Completed" count="45" color="#66BB6A" />
        <SummaryCard label="Closed" count="45" color="#66BB6A" />
        <SummaryCard label="Refused" count="45" color="#66BB6A" />
        <SummaryCard label="Deleted" count="45" color="#66BB6A" />
        <SummaryCard label="Rejected" count="45" color="#66BB6A" />
      </View>
      <FlatList
      data={cardData}
      horizontal
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container}
      renderItem={({ item }) => (
        <IconCard icon={item.icon} label={item.label} color={item.color} nav={item?.nav}/>
      )}
    />  

       <FlatList
      data={requestData}
      horizontal
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.container1}
      
      renderItem={({ item }) => (
        <RequestCard count={item.count} label={item.label} color={item.color} />
      )}
    />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },

  subHeader: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },

  requestBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin:5
  },

  requestText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlignVertical:'center'
  },

  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9',marginBottom:50 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },

  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '33%',
    borderRadius: 16,
    padding: 15,
    marginBottom: 5,
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
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activeTabText: {
    color: '#fff',
    fontWeight: 'bold',
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
  welcomeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 6,
  },
   countBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  labelText: {
    marginLeft: 10,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    lineHeight: 18,
  },
   container1: {
    padding: 16,
  },
  card1: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

   card3: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label3: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    color: '#333',
  },
});
