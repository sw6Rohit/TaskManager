import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  UIManager,
  Platform,
  ScrollView,
} from 'react-native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function Dashboard1() {
  const [attendanceOpen, setAttendanceOpen] = useState(true);
  const [status, setStatus] = useState('CHECKED_OUT');
  // CHECKED_OUT | WORKING | BREAK | LECTURE | COMPLETED

  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef(null);

  // Timer logic
  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const formatTime = total => {
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  // Attendance Actions
  const handleCheckIn = () => {
    setStatus('WORKING');
    setSeconds(0);
    startTimer();
  };

  const handleCheckOut = () => {
    stopTimer();
    setStatus('COMPLETED');
  };

  const handleStartBreak = () => {
    stopTimer();
    setStatus('BREAK');
    setSeconds(0);
    startTimer();
  };

  const handleEndBreak = () => {
    stopTimer();
    setStatus('WORKING');
    setSeconds(0);
    startTimer();
  };

  const handleStartLecture = () => {
    stopTimer();
    setStatus('LECTURE');
    setSeconds(0);
    startTimer();
  };

  const handleEndLecture = () => {
    stopTimer();
    setStatus('WORKING');
    setSeconds(0);
    startTimer();
  };

  const toggleAttendance = () => {
    LayoutAnimation.easeInEaseOut();
    setAttendanceOpen(!attendanceOpen);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Attendance Accordion */}
      <View style={styles.card}>
        <TouchableOpacity onPress={toggleAttendance} style={styles.headerRow}>
          <Text style={styles.headerText}>🕒 Attendance</Text>
          <Text>{attendanceOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {attendanceOpen && (
          <View style={styles.content}>
            {status === 'CHECKED_OUT' && (
              <View style={styles.row}>
                <Text>Checked Out</Text>
                <Button
                  title="Check In"
                  color="#4CAF50"
                  onPress={handleCheckIn}
                />
              </View>
            )}

            {status === 'WORKING' && (
              <>
                <View style={styles.row}>
                  <Text>Working: {formatTime(seconds)}</Text>
                </View>

                <View style={styles.buttonRow}>
                  <Button
                    title="Start Break"
                    color="#2E86DE"
                    onPress={handleStartBreak}
                  />
                  <Button
                    title="Check Out"
                    color="#2E86DE"
                    onPress={handleCheckOut}
                  />
                </View>

                <View style={{marginTop: 10}}>
                  <Button
                    title="Start Lecture"
                    color="#6C5CE7"
                    onPress={handleStartLecture}
                  />
                </View>
              </>
            )}

            {status === 'BREAK' && (
              <View style={styles.row}>
                <Text>On Break: {formatTime(seconds)}</Text>
                <Button
                  title="End Break"
                  color="#F39C12"
                  onPress={handleEndBreak}
                />
              </View>
            )}

            {status === 'LECTURE' && (
              <View style={styles.row}>
                <Text>In Lecture: {formatTime(seconds)}</Text>
                <Button
                  title="End Lecture"
                  color="#E17055"
                  onPress={handleEndLecture}
                />
              </View>
            )}

            {status === 'COMPLETED' && (
              <View style={styles.row}>
                <Text>Day Completed</Text>
                <Button title="View Summary" color="#16A085" />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Task Management */}
      <SimpleCard title="📋 Task Management" />

      {/* Call Logs */}
      <SimpleCard title="📞 Call Logs" />

      {/* Desktop Monitoring */}
      <SimpleCard title="🖥 Desktop Monitoring" />
    </ScrollView>
  );
}

// Reusable Card
const SimpleCard = ({title}) => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
      <Text style={styles.headerText}>{title}</Text>
      <Text>›</Text>
    </View>
  </View>
);

// Simple Button Component
const Button = ({title, color, onPress}) => (
  <TouchableOpacity
    style={[styles.button, {backgroundColor: color}]}
    onPress={onPress}>
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF2F6',
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    marginTop: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 6,
    marginRight: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
