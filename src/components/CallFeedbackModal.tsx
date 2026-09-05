import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export type DisconnectedCall = {
  phoneNumber: string;
  duration: number;
  callType: string;
  timestamp: number;
};

type Props = {
  call: DisconnectedCall | null;
  onClose: () => void;
};

const FEEDBACK_STORAGE_KEY = 'CALL_FEEDBACK_RECORDS';
const statuses = ['Connected', 'Not interested', 'Call back', 'No answer'];

const CallFeedbackModal = ({call, onClose}: Props) => {
  const [remarks, setRemarks] = useState('');
  const [status, setStatus] = useState('Connected');
  const [followUpDate, setFollowUpDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (call) {
      setRemarks('');
      setStatus(call.callType === 'MISSED' ? 'No answer' : 'Connected');
      setFollowUpDate(new Date());
    }
  }, [call]);

  const saveFeedback = async () => {
    if (!call) {
      return;
    }

    const existing = await AsyncStorage.getItem(FEEDBACK_STORAGE_KEY);
    const feedbackRecords = existing ? JSON.parse(existing) : [];
    feedbackRecords.push({
      ...call,
      remarks: remarks.trim(),
      status,
      followUpDate: followUpDate.toISOString(),
      submittedAt: new Date().toISOString(),
    });
    await AsyncStorage.setItem(
      FEEDBACK_STORAGE_KEY,
      JSON.stringify(feedbackRecords),
    );
    onClose();
  };

  return (
    <Modal
      visible={Boolean(call)}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>Call feedback</Text>
            <Text style={styles.subtitle}>Add details for the completed call</Text>

            <Text style={styles.label}>Phone number</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              editable={false}
              value={call?.phoneNumber || 'Unknown number'}
            />

            <Text style={styles.label}>Call status</Text>
            <View style={styles.statusList}>
              {statuses.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.statusButton,
                    status === item && styles.selectedStatus,
                  ]}
                  onPress={() => setStatus(item)}>
                  <Text
                    style={[
                      styles.statusText,
                      status === item && styles.selectedStatusText,
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Remarks</Text>
            <TextInput
              style={[styles.input, styles.remarks]}
              multiline
              placeholder="Enter call remarks"
              value={remarks}
              onChangeText={setRemarks}
            />

            <Text style={styles.label}>Follow-up date</Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateText}>
                {followUpDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={followUpDate}
                mode="date"
                minimumDate={new Date()}
                onChange={(_, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) {
                    setFollowUpDate(date);
                  }
                }}
              />
            )}

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelText}>Later</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={saveFeedback}>
                <Text style={styles.saveText}>Save feedback</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    maxHeight: '90%',
    padding: 22,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: {fontSize: 22, fontWeight: '700', color: '#1b1b1b'},
  subtitle: {marginTop: 4, marginBottom: 20, color: '#666'},
  label: {marginTop: 14, marginBottom: 7, fontWeight: '600', color: '#333'},
  input: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#d8d8d8',
    borderRadius: 10,
    color: '#222',
    backgroundColor: '#fff',
  },
  disabledInput: {backgroundColor: '#f3f4f6', color: '#555'},
  remarks: {height: 90, paddingTop: 12, textAlignVertical: 'top'},
  statusList: {flexDirection: 'row', flexWrap: 'wrap', gap: 8},
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#d8d8d8',
    borderRadius: 18,
  },
  selectedStatus: {backgroundColor: '#2856d8', borderColor: '#2856d8'},
  statusText: {color: '#444'},
  selectedStatusText: {color: '#fff'},
  dateText: {color: '#222'},
  actions: {flexDirection: 'row', gap: 12, marginTop: 24},
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 10,
  },
  cancelText: {fontWeight: '600', color: '#555'},
  saveButton: {
    flex: 2,
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#2856d8',
    borderRadius: 10,
  },
  saveText: {fontWeight: '700', color: '#fff'},
});

export default CallFeedbackModal;
