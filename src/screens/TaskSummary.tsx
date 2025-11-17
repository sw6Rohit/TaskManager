import {useNavigation} from '@react-navigation/native';
import moment from 'moment';
import React, {useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {axiosRequest} from '../utils/ApiRequest';
import Constant from '../utils/Constant';
import Url from '../utils/Url';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';

const FILTERS = [
  {label: 'All task', value: 'All'},
  {label: 'New', value: 'New Task'},
  {label: 'Progress', value: 'In Progress'},
  {label: 'Duetoday', value: 'DueToday'},
  {label: 'Overdue', value: 'OverDue Task'},
  {label: 'Upcoming', value: 'Upcoming'},
  {label: 'Completed', value: 'Completed'},
  {label: 'Close', value: 'Close'},
  {label: 'Refused', value: 'Refused'},
  {label: 'Deleted', value: 'Deleted'},
  {label: 'Reject', value: 'Reject'},
];

const STATUS_COLORS: Record<string, string> = {
  'New Task': '#f9a825',
  'In Progress': '#0288d1',
  Completed: '#2e7d32',
  'OverDue Task': '#d32f2f',
  DueToday: '#ff9800',
  Upcoming: '#673ab7',
  Close: '#607d8b',
  Refused: '#9e9e9e',
  Deleted: '#616161',
  Reject: '#c2185b',
};

const TaskSummary = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const navigation = useNavigation();
  const [toDate, setToDate] = useState(new Date());
  const user = useSelector((state: RootState) => state?.user);
  const [todos, setTodos] = useState<any[]>([]);
  const [oldTodos, setOldTodos] = useState<any[]>([]);
  const [fromDate, setFromDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 2);
    return date;
  });

  // ⬇️ Filtering applied on API data (todos)
  const filteredTasks =
    selectedFilter === 'All'
      ? todos
      : todos.filter(task => task.status === selectedFilter);

  const getTodos = async () => {
    try {
      const param = {
        fromDate: moment(fromDate).format('YYYY-MM-DDThh:mm:ss'),
        toDate: moment(toDate).format('YYYY-MM-DDThh:mm:ss'),
      };

      const getTaskApi = await axiosRequest(
        Url.GET_TASK,
        Constant.API_REQUEST_METHOD.GET,
        param,
      ).then(({data}) => {
        console.log(data);

        const filtered = data.filter(
          (task: any) => task.responsiblePersonId === user?.userInfo?.AgentId,
        );
        setOldTodos(filtered);
        setTodos(filtered);
      });
    } catch (error) {
      console.log(error);
    }
  };

  React.useEffect(() => {
    getTodos(); // 🔥 fetch when screen loads
  }, []);

  const AttendanceStatCard = ({label, count, color, bgColor}) => (
    <View
      style={[styles.card, {borderTopColor: color, backgroundColor: bgColor}]}>
      <Text style={[styles.label, {color}]}>{label}</Text>
      <Text style={[styles.count, {color}]}>{count}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
        {FILTERS.map(f => {
          const count =
            f.value === 'All'
              ? todos.length
              : todos.filter(
                  t => t.TaskStatus === f.value || t.StatusType === f.value,
                ).length;

          return (
            <TouchableOpacity
              key={f.value}
              onPress={() => setSelectedFilter(f.value)}
              style={[
                styles.filterButton,
                selectedFilter === f.value && styles.activeFilter,
              ]}>
              <Text
                style={{color: selectedFilter === f.value ? '#fff' : '#000'}}>
                {f.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.taskId.toString()}
        renderItem={({item}) => (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{item.taskTitle}</Text>
            <Text style={styles.taskTime}>
              DueDate: {moment(item.finishDatetime).format('MMM DD - hh:mm A')}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: STATUS_COLORS[item.status] || '#999'},
              ]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
            <Text numberOfLines={2} style={styles.taskTime}>
              Cqategory: {item.taskCategoryName}
            </Text>
            <Text numberOfLines={2} style={styles.taskTime}>
              Description: {item.taskDescription}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{textAlign: 'center', marginTop: 20}}>
            No tasks found
          </Text>
        }
      />

      <TouchableOpacity
        style={styles.scheduleButton}
        onPress={() => navigation.navigate('DashBoardC')}>
        <Text style={styles.scheduleButtonBaseText}>Add a task</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {padding: 16, backgroundColor: '#fff', flex: 1},
  attendanceCard: {
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 10,
    width: '22%',
  },
  monthButton: {
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderRadius: 10,
    justifyContent: 'center',
  },

  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  filterButton: {padding: 10, borderRadius: 20, backgroundColor: '#f0f0f0'},
  activeFilter: {backgroundColor: '#2196f3'},

  taskCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  taskTitle: {fontSize: 16, fontWeight: 'bold'},
  taskTime: {color: '#666', marginVertical: 4},
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  statusText: {color: '#fff', fontWeight: 'bold'},
  attendanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginVertical: 15,
  },
  scheduleButton: {
    backgroundColor: '#a0f25cff',
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    width: '90%',
    paddingVertical: 10,
    borderRadius: 24,
    alignItems: 'center',
    zIndex: 1000,
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
