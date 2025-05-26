import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const FILTERS = ['All', 'Pending', 'InProgress', 'Completed'];

const TASKS = [
  { id: '1', title: 'Customer Service', status: 'InProgress', time: 'March 25 - 12:00 PM' },
  { id: '2', title: 'Admin Assistance', status: 'Completed', time: 'March 25 - 12:00 PM' },
  { id: '3', title: 'Cashier', status: 'Pending', time: 'March 25 - 12:00 PM' },
];

const STATUS_COLORS = {
  Pending: '#f9a825',
  InProgress: '#0288d1',
  Completed: '#2e7d32',
};

const TaskSummary = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredTasks = selectedFilter === 'All' 
    ? TASKS 
    : TASKS.filter(task => task.status === selectedFilter);

   const AttendanceStatCard = ({ label, count, color, bgColor }) => (
  <View style={[styles.card, { borderTopColor: color, backgroundColor: bgColor }]}>
    <Text style={[styles.label, { color }]}>{label}</Text>
    <Text style={[styles.count, { color }]}>{count}</Text>
  </View>
);

  return (
    <View style={styles.container}>
      {/* Attendance Section */}
    

      {/* Filter Tabs */}
      <View style={styles.filters}>
        {FILTERS.map(filter => (
          <TouchableOpacity
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.activeFilter,
            ]}
          >
            <Text style={{color: selectedFilter === filter ? '#fff' : '#000'}}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskTime}>{item.time}</Text>
            <View style={[styles.statusBadge, {backgroundColor: STATUS_COLORS[item.status]}]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#fff', flex: 1 },
  attendanceCard: { backgroundColor: '#f2f2f2', padding: 10, borderRadius: 10, width: '22%' },
  monthButton: { backgroundColor: '#e0e0e0', padding: 10, borderRadius: 10, justifyContent: 'center' },

  filters: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  filterButton: { padding: 10, borderRadius: 20, backgroundColor: '#f0f0f0' },
  activeFilter: { backgroundColor: '#2196f3' },

  taskCard: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 10 },
  taskTitle: { fontSize: 16, fontWeight: 'bold' },
  taskTime: { color: '#666', marginVertical: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start' },
  statusText: { color: '#fff', fontWeight: 'bold' },
  attendanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginVertical: 15,
  },
   card: {
    flex: 1,
    marginHorizontal: 5,
    padding: 12,
    borderRadius: 10,
    borderTopWidth: 4,
    alignItems: 'center',
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
});

export default TaskSummary;
