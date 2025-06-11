import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
import { axiosRequest } from '../utils/ApiRequest';
import Constant from '../utils/Constant';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { getAddressFromLatLng } from '../utils/Helper';
import DropdownModal from '../components/DropdownModal';

export default function AttendanceHistory() {
  const [attendanceList, setAttendanceList] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const user = useSelector((state: RootState) => state?.user);
  const [selectedMonth, setSelectedMonth] = useState({
    value:  moment().month() + 1,
  });
  const currentYear = moment().year();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    label: (currentYear - i).toString(),
    value: currentYear - i,
  }));

  const [selectedYear, setSelectedYear] = useState({
    value: currentYear,
  });


  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    label: moment().month(i).format('MMMM'),
    value: i + 1,
  }));

  // console.log(selectedMonth);



  useEffect(() => {
    getAttendanceList(selectedMonth, selectedYear);
  }, []);

  const getAttendanceList = async (month: any = selectedMonth, year: any = selectedYear) => {
    try {
      setSelectedMonth(month);
      setSelectedYear(year);
      setLoading(true);

      const param = {
        UserId: user?.userInfo?.AgentId,
        Month: month?.value,
        Year: year?.value,
      };
      const { data } = await axiosRequest(
        'http://61.246.33.108:8069/api/attendance/getreport',
        Constant.API_REQUEST_METHOD.POST,
        param
      );

      // console.log(data);
      
      if (data) {
        const structuredData = await Promise.all(
          data.map(async (item: any) => {
            const inlocationAddress = await splitCoordinates(item?.inlocation);
            const outAddress = await splitCoordinates(item?.outlocation);
            return {
              ...item,
              inlocation: inlocationAddress,
              outlocation: outAddress
            };
          })
        );
        setAttendanceList(structuredData);
        setLoading(false)
      }
    } catch (error) {
      console.log(error);
      setLoading(false)
    }
  };

  async function splitCoordinates(coordString: any) {
    if (
      typeof coordString !== 'string' ||
      coordString.trim() === '' ||
      coordString.indexOf('-') === -1
    ) {
      return null;
    }

    const splitIndex = coordString.indexOf('-', 1); // Skip the first char to handle negative latitude
    if (splitIndex === -1) {
      return null;
    }
    
    
    const lon = parseFloat(coordString.slice(0, splitIndex));
    const lat = parseFloat(coordString.slice(splitIndex + 1));
    // console.log(coordString,lat,lon);

    if (isNaN(lon) || isNaN(lat)) {
      return null;
    }
    try {
      const { fullAddress } = await getAddressFromLatLng(lat, lon);
      return fullAddress;
    } catch (e) {
      console.warn("Address fetch failed:", e);
      return null;
    }
  }


  const renderAttendanceRow = ({ item }) => {
    const dateObj = moment(item.LogDateOnly, 'DD-MM-YYYY');
    const date = dateObj.format('DD');
    const day = dateObj.format('ddd');

    return (
      <View style={styles.attendanceRow}>
        <View style={styles.dateBox}>
          <Text style={styles.dateDay}>{date}</Text>
          <Text style={styles.dateText}>{day}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.timeCardsContainer}>
            <View style={styles.timeCard}>
              <Text style={styles.timeLabel}>Check In</Text>
              <Text style={styles.timeValue}>{item.InTime || '--'}</Text>
            </View>
            <View style={styles.timeCard}>
              <Text style={styles.timeLabel}>Check Out</Text>
              <Text style={styles.timeValue}>{item.OutTime || '--'}</Text>
            </View>
            <View style={styles.timeCard}>
              <Text style={styles.timeLabel}>Total</Text>
              <Text style={styles.timeValue}>{item.WH || '--'}</Text>
            </View>
          </View>
          <View style={styles.locationRow}>
            <Icon name="location-on" size={16} color="#4caf50" />
            <Text style={styles.locationText}>
              {item.inlocation || 'No Location'}
            </Text>
          </View>
          <View style={styles.locationRow}>
            <Icon name="location-on" size={16} color="red" />
            <Text style={styles.locationText}>
              {item.outlocation || 'No Location'}
            </Text>
          </View>
          {item.Status ? (
            <View style={styles.statusRow}>
              <Text style={styles.statusText}>{item.Status}</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Attendance Of {user?.userInfo?.AgentName}</Text>

      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ fontSize: 18, marginRight: 8 }}>Month:</Text>
        <DropdownModal
          data={monthOptions}
          value={selectedMonth}
          onSelect={(item: any) => getAttendanceList({ value: item.value }, selectedYear)}
        />

        <Text style={{ fontSize: 18, marginLeft: 16, marginRight: 8 }}>Year:</Text>
        <DropdownModal
          data={yearOptions}
          value={selectedYear}
          onSelect={(item: any) => getAttendanceList(selectedMonth, { value: item.value })}
        />
      </View>


      <FlatList
        refreshing={loading}
        onRefresh={getAttendanceList}
        data={attendanceList}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderAttendanceRow}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9', marginTop: 10 },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  attendanceRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
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

  timeCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timeCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 8,
    flex: 1,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  timeLabel: { fontSize: 13, color: '#777' },
  timeValue: { fontSize: 15, fontWeight: '600' },

  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  locationText: {
    marginLeft: 4,
    color: '#555',
    flexShrink: 1,
  },
  statusRow: {
    marginTop: 6,
    padding: 6,
    backgroundColor: '#e8eaf6',
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#3f51b5',
  },
});
