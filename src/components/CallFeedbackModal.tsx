import {showMessage} from 'react-native-flash-message';
import axios from 'axios';
import {Picker} from '@react-native-picker/picker';
import {useSelector} from 'react-redux';
import {RootState} from '../redux/store';
import {resolveLeadCall} from '../utils/LeadCallContext';

import DateTimePicker from '@react-native-community/datetimepicker';
import React, {useEffect, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
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

const CallFeedbackModal = ({call, onClose}: Props) => {
  const [remarks, setRemarks] = useState('');
  const [expectedUpdatedAt, setExpectedUpdatedAt] = useState<string | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const user = useSelector((state: RootState) => state.user.userInfo);
  const [leadId, setLeadId] = useState<number | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [responseId, setResponseId] = useState<number | null>(null);
  const [loadingResponses, setLoadingResponses] = useState(false);
  const [responseError, setResponseError] = useState('');
  const [retry, setRetry] = useState(0);
  const selectedResponse = responses.find(
    item => Number(item.ResponseId) === responseId,
  );
  useEffect(() => {
    const controller = new AbortController();
    setResponses([]);
    setResponseId(null);
    setLeadId(null);
    setExpectedUpdatedAt(null);
    setResponseError('');
    if (!call) return () => controller.abort();
    setLoadingResponses(true);
    const load = async () => {
      try {
        const id = await resolveLeadCall();
        console.log(id);

        if (!id)
          throw new Error(
            'No lead linked to this call. Start the call from the Lead Dashboard.',
          );
        if (controller.signal.aborted) return;
        setLeadId(id);
        const {data} = await axios.post(
          'https://studentapinew.university99.com/api/Lead/L01LeadResponse/get-lead-response-page',
          {leadId: id},
          {
            timeout: 20000,
            signal: controller.signal,
            headers: user?.token ? {Authorization: `Bearer ${user.token}`} : {},
          },
        );
        if (data?.isSuccess === false)
          throw new Error(data.message || 'Unable to load responses.');
        if (!Array.isArray(data?.data?.allowedResponses))
          throw new Error('Unexpected lead response format.');
        if (!controller.signal.aborted) {
          setResponses(data.data.allowedResponses);
          setExpectedUpdatedAt(
            data.data.lead?.Updated_at ?? data.data.lead?.updatedAt ?? null,
          );
          if (!data.data.allowedResponses.length)
            setResponseError('No responses available for this lead.');
        }
      } catch (error: any) {
        if (!controller.signal.aborted)
          setResponseError(error.message || 'Unable to load responses.');
      } finally {
        if (!controller.signal.aborted) setLoadingResponses(false);
      }
    };
    load();
    return () => controller.abort();
  }, [call?.phoneNumber, call?.timestamp, user?.userId, user?.token, retry]);
  const [followUpDate, setFollowUpDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (call) {
      setRemarks('');
      setShowDatePicker(false);

      setFollowUpDate(new Date());
    }
  }, [call]);

  const saveFeedback = async () => {
    if (!call || savingRef.current) {
      return;
    }

    if (loadingResponses || !selectedResponse) {
      Alert.alert('Select a response', 'Choose a lead response before saving.');
      return;
    }
    if (selectedResponse.RemarkRequired && !remarks.trim()) {
      Alert.alert('Remarks required', 'Enter remarks for this response.');
      return;
    }
    savingRef.current = true;
    console.log({
      leadId,
      responseId,
      manualFollowUpDateTime: followUpDate.toISOString(),
      manualRemark: remarks.trim(),
      assignedUserId: null,
      mentorUserId: null,
      selectedCourseId: null,
      actionBy: Number(user?.userId) || null,
      ipAddress: null,
      expectedUpdatedAt,
    });

    setSaving(true);
    try {
      const {data} = await axios.post(
        'https://studentapinew.university99.com/api/Lead/L01LeadResponse/update-lead-response',
        {
          leadId,
          responseId,
          manualFollowUpDateTime: followUpDate.toISOString(),
          manualRemark: remarks.trim(),
          assignedUserId: null,
          mentorUserId: null,
          selectedCourseId: null,
          actionBy: Number(user?.userId) || null,
          ipAddress: null,
          expectedUpdatedAt,
        },
        {
          timeout: 20000,
          headers: user?.token ? {Authorization: `Bearer ${user.token}`} : {},
        },
      );
      console.log(data);

      if (data?.isSuccess !== true) {
        throw new Error(
          data?.message ||
            'The server did not confirm that feedback was saved.',
        );
      }
      onClose();
      showMessage({
        message: data.message || 'Feedback saved successfully.',
        type: 'success',
        duration: 3000,
      });
    } catch (error: any) {
      Alert.alert(
        'Feedback not saved',
        error.response?.data?.message || error.message || 'Please try again.',
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={Boolean(call)}
      transparent
      animationType="slide"
      onRequestClose={() => {}}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.card}>
          <TouchableOpacity
            accessibilityLabel="Close feedback"
            accessibilityRole="button"
            style={styles.closeButton}
            onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Text selectable style={styles.label}>
              Lead ID: {leadId ?? '—'}
            </Text>
            <Text style={styles.title}>Call feedback</Text>
            <Text style={styles.subtitle}>
              Add details for the completed call
            </Text>

            <Text style={styles.label}>Response</Text>
            {loadingResponses ? (
              <ActivityIndicator />
            ) : responseError ? (
              <View>
                <Text>{responseError}</Text>
                <TouchableOpacity onPress={() => setRetry(value => value + 1)}>
                  <Text style={styles.label}>Retry responses</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Picker
                selectedValue={responseId}
                accessibilityLabel="Lead response"
                onValueChange={value =>
                  setResponseId(value == null ? null : Number(value))
                }>
                <Picker.Item label="Select response" value={null} />
                {responses.map(item => (
                  <Picker.Item
                    key={String(item.MapId ?? item.ResponseId)}
                    label={item.ResponseName}
                    value={Number(item.ResponseId)}
                  />
                ))}
              </Picker>
            )}
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
              onPress={() => {
                setPickerMode('date');
                setShowDatePicker(true);
              }}>
              <Text style={styles.dateText}>
                {followUpDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.input}
              onPress={() => {
                setPickerMode('time');
                setShowDatePicker(true);
              }}>
              <Text style={styles.dateText}>
                Time:{' '}
                {followUpDate.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={followUpDate}
                mode={pickerMode}
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
              <TouchableOpacity
                disabled={saving || loadingResponses || !selectedResponse}
                style={[
                  styles.saveButton,
                  (saving || loadingResponses || !selectedResponse) && {
                    opacity: 0.5,
                  },
                ]}
                onPress={saveFeedback}>
                <Text style={styles.saveText}>
                  {saving ? 'Saving…' : 'Save feedback'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {fontSize: 30, color: '#333'},
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
