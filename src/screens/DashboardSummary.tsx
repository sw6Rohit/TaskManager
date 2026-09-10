import {
  useFocusEffect,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {axiosRequest} from '../utils/ApiRequest';
import Url from '../utils/Url';
import Constant from '../utils/Constant';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {setTaskMaster} from '../redux/slices/userSlice';
import {findCoordinates} from '../utils/Helper';
import WelcomeModal from '../components/WelcomeModal';
import CallAnalyticsScreen from './CallAnalyticsScreen';
import {showMessage} from 'react-native-flash-message';
import { requestCallLogPermission } from '../components/CallLogService';

const DashboardSummary = () => {
  const user = useSelector((state: RootState) => state?.user);
  const taskMaster = useSelector((state: RootState) => state.user.taskMaster);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [showWelcomeModal, setShowWelcomeModal] = React.useState(true);
  const [tmsStatus, setTmsStatus] = useState<any>(null);
  const isFocused = useIsFocused();
  const route = useRoute();
  const userId = user.userInfo?.userId;
  const date = moment().format('YYYY-MM-DD');
  const [attendanceAgreementShown, setAttendanceAgreementShown] =
    useState(false);
  const [isMarked, setisMarked] = useState<any>({
    In_Time: '00:00:00.0000000',
    Out_Time: '00:00:00.0000000',
  });
  const [isCompletedCount, setIsCompletedCount] = useState<any>({});
  const [IscheckLimit, setIScheckLimit] = useState<any>({});
  const [loading, setLoading] = useState<any>(false);

  const tmsUrl = `http://61.246.33.108:8069/api/tms/status?userId=${userId}&date=${date}`;
  const attendanceUrl = `http://61.246.33.108:8069/api/attendance/latest?userId=${userId}`;

  // useEffect(() => {
  //   getTmsStatus();
  // }, []);

  const fetchTmsStatus = async () => {
    const {data} = await axiosRequest(tmsUrl, Constant.API_REQUEST_METHOD.GET);
    const attendance = await axiosRequest(
      attendanceUrl,
      Constant.API_REQUEST_METHOD.GET,
    );
    setTmsStatus(data?.TMSStatus);
    setisMarked(attendance?.data);
    console.log(data);
  };

  useEffect(() => {
    getProjectList();
    getAttendanceList();
    getDistancefromOffice();
  }, []);

  useEffect(() => {
    if (
      route.params?.fromLogin &&
      user?.userInfo?.userId &&
      !attendanceAgreementShown
    ) {
      setAttendanceAgreementShown(true);
      showCurrentMonthAttendanceAlert();
    }
  }, [route.params, user?.userInfo?.userId, attendanceAgreementShown]);
  const getProjectList = async () => {
    try {
      const param = {
        UserId: user?.userInfo?.AgentId,
        TaskId: -1,
      };
      await axiosRequest(
        Url.GET_PROJECTLIST,
        Constant.API_REQUEST_METHOD.POST,
        param,
      ).then(({data}) => {
        dispatch(setTaskMaster(data));
        // console.log(data);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const getAttendanceList = async () => {
    try {
      const currentMonth = moment().month() + 1; // month() is 0-indexed, so add 1
      const currentYear = moment().year();

      const param = {
        UserId: user?.userInfo?.userId,
        Month: currentMonth,
        Year: currentYear,
      };

      await axiosRequest(
        'http://61.246.33.108:8069/api/attendance/getreport',
        Constant.API_REQUEST_METHOD.POST,
        param,
      ).then(({data}) => {
        // console.log(data);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const formatAttendanceReport = (data: any[] = []) => {
    if (!Array.isArray(data) || data.length === 0) {
      return 'No attendance records found for this month.';
    }

    return data
      .map(item => {
        const attendanceDate = item?.LogDateOnly || item?.Date || '--';
        const inTime = item?.InTime || item?.In_Time || '--';
        const outTime = item?.OutTime || item?.Out_Time || '--';

        return `${attendanceDate}  IN: ${inTime}  OUT: ${outTime}`;
      })
      .join('\n');
  };

  const showCurrentMonthAttendanceAlert = async () => {
    try {
      const currentMonth = moment().month() + 1;
      const currentYear = moment().year();
      const monthName = moment().format('MMMM YYYY');
      const param = {
        UserId: user?.userInfo?.userId,
        Month: currentMonth,
        Year: currentYear,
      };

      const {data} = await axiosRequest(
        'http://61.246.33.108:8069/api/attendance/getreport',
        Constant.API_REQUEST_METHOD.POST,
        param,
      );

      Alert.alert(
        `${monthName} Attendance`,
        formatAttendanceReport(data),
        [
          {text: 'Disagree', style: 'cancel'},
          {text: 'Agree', style: 'default'},
        ],
        {cancelable: false},
      );
    } catch (error) {
      console.log(error);
      Alert.alert(
        'Attendance',
        'Unable to load current month attendance. Please try again later.',
      );
    }
  };

  const getDistancefromOffice = async () => {
    const userLocation: any = await findCoordinates().then(
      async (coordinates: any) => {
        console.log(coordinates?.coords);

        const distance = getDistanceFromLatLonInKm(
          coordinates?.coords.latitude,
          coordinates?.coords.longitude,
          28.693722,
          77.171779,
        );
        console.log(distance); // or setState
        // setCampaign(campaignWithDistance)
        // return campaignWithDistance;
      },
    );
  };

  function getDistanceFromLatLonInKm(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ) {
    const R = 6371; // Radius of the Earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
  }
  const getTmsStatus = async () => {
    const userId = user.userInfo?.userId;
    const date = moment().format('YYYY-MM-DD');
    console.log(date);

    setLoading(true);
    const tmsUrl = `http://61.246.33.108:8069/api/tms/status?userId=${userId}&date=${date}`;
    const attendanceUrl = `http://61.246.33.108:8069/api/attendance/latest?userId=${userId}`;
    const checkLimit = `http://61.246.33.108:8069/api/tasks/check-limit?responsiblePersonId=${userId}`;
    const completedCount = `http://61.246.33.108:8069/api/tasks/other/completed-count?responsiblePersonId=${userId}`;

    try {
      const [
        tmsResponse,
        attendanceResponse,
        checkLimitRes,
        completedCountRes,
      ] = await Promise.all([
        axiosRequest(tmsUrl, Constant.API_REQUEST_METHOD.GET),
        axiosRequest(attendanceUrl, Constant.API_REQUEST_METHOD.GET),
        axiosRequest(checkLimit, Constant.API_REQUEST_METHOD.GET),
        axiosRequest(
          completedCount,
          Constant.API_REQUEST_METHOD.GET,
          {},
          60000,
        ),
      ]).finally(() => {
        setLoading(false);
      });
      console.log(tmsResponse);

      if (tmsResponse?.data) {
        setTmsStatus(tmsResponse.data.TMSStatus);
      }

      if (attendanceResponse?.data) {
        setisMarked(attendanceResponse.data); // or whatever setter you're using
      }
      if (checkLimitRes.data) {
        setIScheckLimit(checkLimitRes.data); // or whatever setter you're using
      }
      if (completedCountRes.data) {
        setIsCompletedCount(completedCountRes.data);
      }
      setLoading(false);
      return {
        tmsStatus: tmsResponse.data.TMSStatus,
        isMarked: attendanceResponse.data,
        isCheckLimit: checkLimitRes.data,
        completedCount: completedCountRes.data,
      };
    } catch (error) {
      setLoading(false);
      console.error('Error fetching TMS or Attendance status:', error);
      // Optionally show an Alert here if needed
    }
  };
const checkCallLogPermissionAndNavigate = async () => {
  try {
    // Non-Android
    if (Platform.OS !== 'android') {
      onPressAttendance();
      return;
    }

    // Check whether already granted
    const alreadyGranted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
    );

    if (alreadyGranted) {
      onPressAttendance();
      return;
    }

    // Show Android native Allow / Deny permission dialog
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
      {
        title: 'Call Log Permission',
        message:
          'Call Log permission is required before you can mark attendance.',
        buttonPositive: 'Allow',
        buttonNegative: 'Deny',
      },
    );

    console.log('READ_CALL_LOG Permission:', result);

    // ALLOW
    if (result === PermissionsAndroid.RESULTS.GRANTED) {
      onPressAttendance();
      return;
    }

    // DENY - user can try again
    if (result === PermissionsAndroid.RESULTS.DENIED) {
      Alert.alert(
        'Call Log Permission Required',
        'You cannot mark attendance without Call Log permission.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Allow Permission',
            onPress: () => {
              checkCallLogPermissionAndNavigate();
            },
          },
        ],
        {cancelable: false},
      );

      return;
    }

    // DON'T ASK AGAIN / permanently denied
    if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      showCallLogSettingsAlert();
      return;
    }
  } catch (error) {
    console.log('Call Log Permission Error:', error);

    Alert.alert(
      'Permission Error',
      'Unable to check Call Log permission. Please try again.',
    );
  }
};

const showCallLogSettingsAlert = () => {
  Alert.alert(
    'App Installation Error',
    'Some error occurred while installing the app. Kindly uninstall and reinstall the app.',
    [
      {
        text: 'OK',
        style: 'default',
      },
    ],
    {cancelable: false},
  );
};

  const AttendanceRow = ({date, day, inTime, outTime, total, location}) => (
    <View style={styles.attendanceRow}>
      {/* Date Box */}
      <View style={styles.dateBox}>
        <Text style={styles.dateDay}>{date}</Text>
        <Text style={styles.dateText}>{day}</Text>
      </View>

      {/* Row-wise Cards */}
      <View style={{flex: 1}}>
        <View style={styles.timeCardsContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('AttendanceScreen')}
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
  const AttendanceStatCard = ({label, count, color, bgColor}) => (
    <View
      style={[styles.card2, {borderTopColor: color, backgroundColor: bgColor}]}>
      <Text style={[styles.label, {color}]}>{label}</Text>
      <Text style={[styles.count, {color}]}>{count}</Text>
    </View>
  );

  const SummaryCard = ({label, count, color}) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('TaskSummary')}
      style={[styles.card, {backgroundColor: color}]}>
      <Text style={styles.cardCount}>{count}</Text>
      <Text style={styles.cardLabel}>{label}</Text>
      <Icon name="more-horiz" size={20} color="#fff" style={styles.cardIcon} />
    </TouchableOpacity>
  );
  const requestData = [
    {id: '1', count: '04', label: 'Leave\nRequest', color: '#3478F6'},
    {id: '2', count: '12', label: 'Claim\nRequest', color: '#22C55E'},
    {id: '3', count: '01', label: 'Other\nRequest', color: '#FB923C'},
  ];

  const RequestCard = ({count, label, color}: any) => (
    <View style={styles.card1}>
      <View style={[styles.countBox, {backgroundColor: color}]}>
        <Text style={styles.countText}>{count}</Text>
      </View>
      <Text style={styles.labelText}>{label}</Text>
    </View>
  );
  const cardData = [
    {
      id: '1',
      label: 'Attendance',
      icon: 'calendar-check',
      color: '#2563EB',
      nav: 'AttendanceHistory',
    },
    {
      id: '2',
      label: 'Lead Entry',
      icon: 'calendar-remove',
      color: '#DC2626',
      nav: 'StudentList',
    },
    {id: '3', label: 'Payroll', icon: 'checkbook', color: '#D97706', nav: ''},
  ];

  const hasPendingLimitIssue = tmsData =>
    tmsData?.isCheckLimit?.maxPendingLimit >
    tmsData?.isCheckLimit?.pendingTaskCount;

  const showPendingLimitAlert = tmsData =>
    Alert.alert(tmsData?.isCheckLimit?.message);

  const isToday = date =>
    moment(date).format('DD-MM-YYYY') === moment().format('DD-MM-YYYY');

  const navigateAttendance = () => navigation.navigate('AttendanceScreen');

  const alertAlreadyMarked = () =>
    Alert.alert(
      'You Have already marked CheckIn and Checkout',
      'Do you want to mark again for today attendance',
      [{text: 'Yes', onPress: navigateAttendance}, {text: 'No'}],
    );

  const alertTmsInactive = () =>
    Alert.alert(
      'Alert',
      `You can not mark Attendance without TMS
Kindly fill TMS and then Mark Attendance again
Any Issue Call 9711612832/32 or email hr@atm.edu.in`,
    );

  const alertNoCompletedTask = agentName =>
    Alert.alert(
      'Alert',
      `Dear ${agentName}, you cannot mark evening attendance
without approval of completed tasks from your team leader

Any Issue Call 9711612832/32 or email hr@atm.edu.in`,
    );

  const alertUnknownStatus = date =>
    Alert.alert(
      `Got Unknown status of attendance Date ${moment(date).format(
        'DD-MM-YYYY',
      )}`,
      `Allowing for Attendance but you cannot mark Attendance without TMS in the evening.
Any Issue Call 9711612832/32 or email hr@atm.edu.in`,
      [{text: 'OK', onPress: navigateAttendance}],
    );

  const onPressAttendance = async () => {
    // navigation.navigate('AttendanceScreen');

    if (user?.userInfo?.entityTypeId != 2) {
      navigation.navigate('AttendanceScreen');
    } else
      await getTmsStatus().then(tmsData => {
        console.log(tmsData?.tmsStatus);
        const status = tmsData?.isMarked?.AttendanceStatus;
        const date = tmsData?.isMarked?.Date;
        console.log(status, date, user)
        // return;
        const isTodayMarked = isToday(date);

        // ✅ Morning + Evening marked
        if (status === 'Morning and Evening' && isTodayMarked) {
          alertAlreadyMarked();
          return;
        }

        // ✅ Morning only
        if (status === 'Morning Only' && isTodayMarked) {
          if (tmsData?.tmsStatus !== 'active') {
            alertTmsInactive();
            return;
          }

          // if (tmsData?.completedCount?.completedTaskCount <= 0) {
          //   alertNoCompletedTask(user?.userInfo?.AgentName);
          //   return;
          // }

          // if (hasPendingLimitIssue(tmsData)) {
          //   showPendingLimitAlert(tmsData);
          //   return;
          // }

          navigateAttendance();
          return;
        }

        // ✅ Unknown status
        if (status === 'Unknown') {
          alertUnknownStatus(date);
          return;
        }

        // ✅ Not marked or different date
        if (status === 'Not Marked' || !isTodayMarked) {
          if (tmsData?.tmsStatus === 'inactive') {
            alertTmsInactive();
          }

          // if (tmsData?.completedCount?.completedTaskCount > 0) {
          //   alertNoCompletedTask(user?.userInfo?.AgentName);
          // }

          // if (hasPendingLimitIssue(tmsData)) {
          //   showPendingLimitAlert(tmsData);
          // }

          navigateAttendance();
          return;
        }

        // ✅ Default
        navigateAttendance();
      });
  };

  const IconCard = ({icon, label, color, nav}: any) => (
    <TouchableOpacity
      style={[styles.card3, {borderColor: color}]}
      onPress={() => navigation.navigate(nav)}>
      <MaterialCommunityIcons name={icon} size={30} color={color} />
      <Text style={styles.label3}>{label} </Text>
    </TouchableOpacity>
  );
  
  return (
    <FlatList
      data={[1]} // dummy data
      renderItem={() => null}
      keyExtractor={() => 'dummy'}
      ListHeaderComponent={
        <View style={styles.container}>
          <WelcomeModal
            visible={showWelcomeModal}
            onClose={() => setShowWelcomeModal(false)}
            userName={user?.userInfo?.userName}
            apiData={tmsStatus}
          />

          <StatusBar hidden={true} />
          <View style={styles.headerContainer}>
            <View style={{width: '90%'}}>
              <Text style={styles.welcomeText}>{`Welcome, ${
                user?.userInfo?.userName || 'Guest'
              }(App version: ${user.userInfo?.apkVersion})`}</Text>
              <Text>{`User Type: ${
                user?.userInfo?.entityTypeId == 1 ? 'Student' : 'Employee'
              }`}</Text>
              {user?.userInfo?.Role_id === '2' && (
                <Text>{`${user?.userInfo?.branchName}`}</Text>
              )}
              <Text style={styles.header}>Dashboard</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('UserProfile')}>
              <Image
                source={{
                  uri: 'https://xsgames.co/randomusers/avatar.php?g=male',
                }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.attendanceContainer}>
            <AttendanceStatCard
              label="Present"
              count="13"
              color="#4CAF50"
              bgColor="#E8F5E9"
            />
            <AttendanceStatCard
              label="Absents"
              count="02"
              color="#F44336"
              bgColor="#FFEBEE"
            />
            <AttendanceStatCard
              label="Late in"
              count="04"
              color="#FF9800"
              bgColor="#FFF3E0"
            />
          </View>

          <View style={[styles.card, {width: '100%'}]}>
            <View style={styles.headerRow}>
              <View style={{flexDirection: 'column'}}>
                <Text style={styles.title}>Today's Attendance</Text>
                <Text style={styles.date}>
                  {moment().format('dddd, DD MMM YYYY')}
                </Text>
              </View>
              <View style={{flexDirection: 'column'}}>
                <TouchableOpacity
                  style={styles.requestBtn}
                  onPress={() => checkCallLogPermissionAndNavigate()}>
                  {loading ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={styles.requestText}>+ Attendance</Text>
                  )}
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
              <Text style={styles.statTitle}>
                {moment(isMarked?.In_Time, 'HH:mm:ss.SSSSSSS').format(
                  'hh:mm A',
                )}
              </Text>
              <Text>Check In</Text>
            </View>
            <View style={styles.statBox}>
              <MaterialCommunityIcons
                name="clock-time-three"
                size={20}
                color={'#333'}
              />
              <Text style={styles.statTitle}>
                {moment(isMarked?.Out_Time, 'HH:mm:ss.SSSSSSS').format(
                  'hh:mm A',
                )}
              </Text>
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
              onPress={() => navigation.navigate('DashBoardC')}>
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
            keyExtractor={item => item.id}
            contentContainerStyle={{}}
            renderItem={({item}) => (
              <IconCard
                icon={item.icon}
                label={item.label}
                color={item.color}
                nav={item?.nav}
              />
            )}
          />

          <FlatList
            data={requestData}
            horizontal
            keyExtractor={item => item.id}
            contentContainerStyle={styles.container1}
            renderItem={({item}) => (
              <RequestCard
                count={item.count}
                label={item.label}
                color={item.color}
              />
            )}
          />
          {(user?.userInfo?.userId =="884" || user?.userInfo?.userId=="907") &&<CallAnalyticsScreen />}
        </View>
      }
    />
  );
};
export default DashboardSummary;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 5,
    marginTop: 10,
  },

  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  welcomeText: {
    fontSize: 16,
    color: '#333',
  },

  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 4,
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
    margin: 5,
  },

  requestText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
    textAlignVertical: 'center',
  },

  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 50,
  },

  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
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
  cardCount: {fontSize: 22, fontWeight: 'bold', color: '#fff'},
  cardLabel: {fontSize: 16, color: '#fff', marginTop: 5},
  cardIcon: {position: 'absolute', top: 10, right: 10},

  attendanceDetails: {flex: 1},
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
  dateDay: {fontSize: 18, fontWeight: 'bold'},
  dateText: {fontSize: 14, color: '#555'},

  timeCardsContainer: {flex: 1, flexDirection: 'row'},
  timeCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    elevation: 1,
    flex: 1,
    marginHorizontal: 5,
  },
  timeLabel: {fontSize: 13, color: '#777', textAlign: 'center'},
  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },

  locationRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4},
  locationText: {marginLeft: 4, color: '#555', flexShrink: 1},
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
    paddingVertical: 10,
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
