import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  ScrollView,
} from 'react-native';

// Filters with numeric statusFlag values
const filters = [
  { statusFlag: 1, label: 'All task' },
  { statusFlag: 2, label: 'New' },
  { statusFlag: 3, label: 'Progress' },
  { statusFlag: 4, label: 'Duetoday' },
  { statusFlag: 5, label: 'Overdue' },
  { statusFlag: 6, label: 'Upcoming' },
  { statusFlag: 7, label: 'Completed' },
  { statusFlag: 8, label: 'Close' },
  { statusFlag: 9, label: 'Refused' },
  { statusFlag: 10, label: 'Deleted' },
  { statusFlag: 11, label: 'Reject' },
];

// Status count object with numeric keys
const statusCounts: Record<number, number> = {
  1: 5,
  2: 0,
  3: 0,
  4: 0,
  5: 5,
  6: 0,
  7: 0,
  8: 0,
  9: 0,
  10: 0,
  11: 0,
};

// Enable layout animation for Android
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TaskFilters = ({taskList}:any) => {
  const [expandedSection, setExpandedSection] = useState<number | null>(null);
  console.log(taskList);
  

  const toggleSection = (statusFlag: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedSection((prev) => (prev === statusFlag ? null : statusFlag));
  };

  return (
    <ScrollView style={styles.container}>
      {filters.map((item) => {
        const isExpanded = expandedSection === item.statusFlag;
        const count = statusCounts[item.statusFlag] ?? 0;

        return (
          <View key={item.statusFlag} style={styles.card}>
            <TouchableOpacity
              onPress={() => toggleSection(item.statusFlag)}
              style={styles.header}
            >
              <Text style={styles.headerText}>
                {item.label} 
              </Text>
            </TouchableOpacity>
            <ScrollView style={{maxHeight:400}}>
            {
            isExpanded && taskList.filter((f:any)=>f?.statusFlag==item.statusFlag).map((task:any)=>((
              <View style={styles.body}>
                <Text style={styles.bodyText}>{task?.taskTitle}</Text>
              </View>
            )))}
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  card: {
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  header: {
    padding: 12,
    backgroundColor: '#f08030',
  },
  headerText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
  body: {
    padding: 12,
    backgroundColor: '#fafafa',
  },
  bodyText: {
    color: '#333',
  },
});

export default TaskFilters;
