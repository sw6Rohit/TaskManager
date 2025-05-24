import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';






export default function DashboardSummary() {
    const navigation=useNavigation();
    
    const AttendanceRow = ({ date, day, inTime, outTime, total, location }) => (
      <View style={styles.attendanceRow}>
        {/* Date Box */}
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{date}</Text>
          <Text style={styles.dateText}>{day}</Text>
        </View>
    
        {/* Row-wise Cards */}
        <View style={{flex:1}}>
        <View style={styles.timeCardsContainer}>
          <TouchableOpacity 
         onPress={()=>navigation.navigate("AttendanceScreen")}
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
    
const SummaryCard = ({ label, count, color }) => (
  <TouchableOpacity 
  onPress={()=>navigation.navigate("TaskSummary")}
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

      {/* Attendance History */}
      <Text style={styles.subHeader}>Attendance History</Text>
      <AttendanceRow
        date="22"
        day="Wed"
        inTime="07:57"
        outTime="17:00"
        total="08:03"
        location="Office, West Jakarta, Indonesia"
      />
      <AttendanceRow
        date="21"
        day="Tue"
        inTime="08:03"
        outTime="17:08"
        total="08:05"
        location="Office, West Jakarta, Indonesia"
      />
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

timeCardsContainer: { flex: 1,flexDirection:'row',},
timeCard: {
  backgroundColor: '#f5f5f5',
  borderRadius: 10,
  padding: 10,
  marginBottom: 8,
  elevation: 1,
  flex:1,
  marginHorizontal:5,
  
},
timeLabel: { fontSize: 13, color: '#777',textAlign:'center' },
timeValue: { fontSize: 16, fontWeight: '600', marginTop: 2,textAlign:'center' },

locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
locationText: { marginLeft: 4, color: '#555', flexShrink: 1 },

});
