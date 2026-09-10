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
import {syncCallLogsOnce} from '../utils/CallSyncService';
import { axiosRequest } from '../utils/ApiRequest';
import Constant from '../utils/Constant';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';
import {TouchableOpacity} from 'react-native';

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
};

const CallAnalyticsScreen = () => {
  const {taskMaster} = useSelector((state: RootState) => state?.user);
  const user = useSelector((state: RootState) => state?.user);

  const [stats, setStats] = useState<any>(null);
  const [userList, setUserList] = useState<any[]>([]);

  const [selectedEmp, setSelectedEmp] = useState<any>(null);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [showFromDate, setShowFromDate] = useState(false);
  const [showToDate, setShowToDate] = useState(false);
  const [callTypes, setCallTypes] = useState<any[]>([]);


  // ✅ PUT FUNCTION HERE
  const getCallTypes = async () => {
    try {
      const {data} = await axiosRequest(
        'https://studentapinew.university99.com/api/CallMonitoring/call-types?isActive=true',
        Constant.API_REQUEST_METHOD.GET,
      );

      console.log('Call Types Response:', data);

      if (data?.isSuccess) {
        setCallTypes(data?.data || []);
      }
    } catch (error) {
      console.error('Error fetching call types:', error);
    }
  };


  // ✅ USER DROPDOWN
  useEffect(() => {
    const dataforDropdown =
      taskMaster?.userList?.map((item: any) => ({
        label: item?.AgentName,
        value: item?.AgentId,
      })) || [];

    setUserList(dataforDropdown);
  }, [taskMaster?.userList]);


  // ✅ CALL TYPE API
  useEffect(() => {
    getCallTypes();
  }, []);


  // ✅ LOCAL SYNC
  useEffect(() => {
    const fetchLogs = async () => {
      const hasPermission = await requestCallLogPermission();

      if (!hasPermission) {
        return;
      }

      const data = await getCallStats();

      setStats(data);

      const userId =
        user.userInfo?.AgentId ||
        user.userInfo?.linkId;

      await syncCallLogsOnce(userId);
    };

    fetchLogs();
  }, []);


  // ✅ ONLY AFTER ALL FUNCTIONS / HOOKS
  if (!stats) {
    return (
      <ActivityIndicator
        size="large"
        style={{marginTop: 100}}
      />
    );
  }

  const data = [
  {
    title: 'Total Phone Calls',
    count: stats.total,
    duration: formatDuration(stats?.durations?.total),
    icon: 'phone',
  },
  {
    title: 'Incoming Calls',
    count: stats?.incoming,
    duration: formatDuration(stats?.durations?.incoming),
    icon: 'arrow-down-left',
  },
  {
    title: 'Outgoing Calls',
    count: stats?.outgoing,
    duration: formatDuration(stats?.durations?.outgoing),
    icon: 'arrow-up-right',
  },
  {
    title: 'Missed Calls',
    count: stats.missed,
    icon: 'phone-missed',
  },
  {
    title: 'Rejected Calls',
    count: stats.rejected,
    icon: 'x-circle',
  },
  {
    title: 'Never Attended',
    count: stats.neverAttended,
    icon: 'phone-off',
  },
];

  const onSelectEmp = async ({value}: any) => {
  setSelectedEmp(value);
  await fetchReport(value, fromDate, toDate);
};

const fetchReport = async (
  empId = selectedEmp,
  startDate = fromDate,
  endDate = toDate,
) => {
  try {
    if (!empId) return;

    const payload = {
      fromDate: moment(startDate)
        .startOf('day')
        .utc()
        .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),

      toDate: moment(endDate)
        .endOf('day')
        .utc()
        .format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),

      empl_id: Number(empId),
      callType: '-1',
    };

    console.log('Payload:', payload);

    const {data} = await axiosRequest(
      'https://studentapinew.university99.com/api/CallMonitoring/filtered-report',
      Constant.API_REQUEST_METHOD.POST,
      payload,
    );

    if (data?.isSuccess) {
      const reportList = data?.data || [];
      setStats(calculateStatsFromApi(reportList));
    }
  } catch (error) {
    console.error('Error fetching report:', error);
  }
};

const calculateStatsFromApi = (reportData: any[]) => {
  const incoming = reportData.filter(
    (item: any) => Number(item.Call_Type) === 1,
  );

  const outgoing = reportData.filter(
    (item: any) => Number(item.Call_Type) === 2,
  );

  const missed = reportData.filter(
    (item: any) => Number(item.Call_Type) === 3,
  );

  const rejected = reportData.filter(
    (item: any) => Number(item.Call_Type) === 4,
  );

  const neverAttended = reportData.filter(
    (item: any) => Number(item.Call_Type) === 5,
  );

  const sumDuration = (items: any[]) =>
    items.reduce(
      (total: number, item: any) =>
        total + Number(item.Duration_In_Seconds || 0),
      0,
    );

  return {
    total: reportData.length,
    incoming: incoming.length,
    outgoing: outgoing.length,
    missed: missed.length,
    rejected: rejected.length,
    neverAttended: neverAttended.length,

    durations: {
      total: sumDuration(reportData),
      incoming: sumDuration(incoming),
      outgoing: sumDuration(outgoing),
    },
  };
};

  return (
    <View style={styles.container}>
      <View style={styles.dateRow}>
  <View style={styles.dateBoxWrapper}>
    <Text style={styles.label}>From Date</Text>

    <TouchableOpacity
      style={styles.dateBox}
      onPress={() => setShowFromDate(true)}>
      <Icon name="calendar" size={18} color="#333" />

      <Text style={styles.dateText}>
        {moment(fromDate).format('DD-MMM-YYYY')}
      </Text>
    </TouchableOpacity>
  </View>

  <View style={styles.dateBoxWrapper}>
    <Text style={styles.label}>To Date</Text>

    <TouchableOpacity
      style={styles.dateBox}
      onPress={() => setShowToDate(true)}>
      <Icon name="calendar" size={18} color="#333" />

      <Text style={styles.dateText}>
        {moment(toDate).format('DD-MMM-YYYY')}
      </Text>
    </TouchableOpacity>
  </View>
</View>

{showFromDate && (
  <DateTimePicker
    value={fromDate}
    mode="date"
    display="default"
    maximumDate={toDate}
    onChange={(event, selectedDate) => {
      setShowFromDate(false);

      if (selectedDate) {
        setFromDate(selectedDate);

        if (selectedEmp) {
          fetchReport(selectedEmp, selectedDate, toDate);
        }
      }
    }}
  />
)}

{showToDate && (
  <DateTimePicker
    value={toDate}
    mode="date"
    display="default"
    minimumDate={fromDate}
    maximumDate={new Date()}
    onChange={(event, selectedDate) => {
      setShowToDate(false);

      if (selectedDate) {
        setToDate(selectedDate);

        if (selectedEmp) {
          fetchReport(selectedEmp, fromDate, selectedDate);
        }
      }
    }}
  />
)}

<Text style={styles.label}>Select User</Text>

      <DropdownModal
        placeholder={'Select User'}
        data={userList}
        onSelect={(item:any) => {
          onSelectEmp(item)
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
  dateRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 16,
},

dateBoxWrapper: {
  width: '48%',
},

dateBox: {
  height: 48,
  backgroundColor: '#fff',
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 12,
  flexDirection: 'row',
  alignItems: 'center',
},

dateText: {
  marginLeft: 8,
  fontSize: 14,
  color: '#333',
},
});

export default CallAnalyticsScreen;
