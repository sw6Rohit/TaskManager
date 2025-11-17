import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  PermissionsAndroid,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {
  getCallStats,
  requestCallLogPermission,
} from '../components/CallLogService';
import DropdownModal from '../components/DropdownModal';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};

const CallAnalyticsScreen = () => {
  const {taskMaster} = useSelector((state: RootState) => state?.user);
  const [stats, setStats] = useState(null);
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    const dataforDropdown = taskMaster?.userList?.map((item: any) => {
      return {
        label: item?.AgentName,
        value: item?.AgentId,
      };
    });
    setUserList(dataforDropdown);
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      const hasPermission = await requestCallLogPermission();
      if (!hasPermission) return;

      const data = await getCallStats();
      setStats(data);
    };

    fetchLogs();
  }, []);

  if (!stats) {
    return <ActivityIndicator size="large" style={{marginTop: 100}} />;
  }

  const data = [
    {
      title: 'Total Phone Calls',
      count: stats.total,
      duration: formatDuration(stats.durations.total),
      icon: 'phone',
    },
    {
      title: 'Incoming Calls',
      count: stats.incoming,
      duration: formatDuration(stats.durations.incoming),
      icon: 'arrow-down-left',
    },
    {
      title: 'Outgoing Calls',
      count: stats.outgoing,
      duration: formatDuration(stats.durations.outgoing),
      icon: 'arrow-up-right',
    },
    {title: 'Missed Calls', count: stats.missed, icon: 'phone-missed'},
    {title: 'Rejected Calls', count: stats.rejected, icon: 'x-circle'},
    {title: 'Never Attended', count: stats.neverAttended, icon: 'phone-off'},
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select User</Text>
      <DropdownModal
        placeholder={'Select User'}
        data={userList}
        onSelect={item => {
          // setFieldValue('pipeline', item.value);
          // setSelectedPipeline(item?.value)
          // getStages(item?.value)
        }}
      />
      <FlatList
        data={data}
        numColumns={2}
        keyExtractor={item => item.title}
        renderItem={({item}) => (
          <View style={styles.card}>
            <Icon name={item.icon} size={20} color="#000" style={styles.icon} />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.count}>{item.count}</Text>
            {item.duration && (
              <Text style={styles.duration}>{item.duration}</Text>
            )}
          </View>
        )}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F7EDFF',
    flex: 1,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#EADCFD',
    borderRadius: 10,
    width: '48%',
    padding: 12,
    elevation: 2,
  },
  icon: {
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    color: '#333',
  },
  count: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  duration: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default CallAnalyticsScreen;
