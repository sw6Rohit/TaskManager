import { showMessage } from 'react-native-flash-message';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { resolveLeadCall } from '../utils/LeadCallContext';

import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import moment from 'moment';

export type DisconnectedCall = {
  phoneNumber: string;
  duration: number;
  callType: string;
  timestamp: number;
};

type Props = {
  call: DisconnectedCall | null;
  selectedLeadId?: number;
  onClose: () => void;
};

const CallFeedbackModal = ({ call, selectedLeadId, onClose }: Props) => {
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
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [stages, setStages] = useState<any[]>([]);
  const [reopenStageId, setReopenStageId] = useState<number | null>(null);
  const [reopenRemark, setReopenRemark] = useState('');
  const selectedResponse = responses.find(
    item => Number(item.ResponseId) === responseId,
  );


  const loadStages = async () => {
    try {
      const { data } = await axios.post(
        'https://studentapinew.university99.com/api/Lead/M03Stage/operation',
        
        {"type":5,"id":2,"mentorIds":[],"sourceId":"","campaignId":"","leadFilter":"all",
          loginUserId: Number(user?.userId) || null
        },
        {
          headers: user?.token
            ? { Authorization: `Bearer ${user.token}` }
            : {},
        },
      );
      console.log(data?.data);
      

      setStages(data?.data || []);
    } catch (error: any) {
      console.log(error?.response);
      
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Unable to load stages.',
      );
    }
  };

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
        const id = selectedLeadId ?? (await resolveLeadCall());
        console.log(id);

        if (!id)
          throw new Error(
            'No lead linked to this call. Start the call from the Lead Dashboard.',
          );
        if (controller.signal.aborted) return;
        setLeadId(id);
        const { data } = await axios.post(
          'https://studentapinew.university99.com/api/Lead/L01LeadResponse/get-lead-response-page',
          { leadId: id },
          {
            timeout: 20000,
            signal: controller.signal,
            headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
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
  }, [call?.phoneNumber, call?.timestamp, selectedLeadId, user?.userId, user?.token, retry]);
  const [followUpDate, setFollowUpDate] = useState(moment().add(1, 'day').hour(9).minute(0).second(0).millisecond(0).toDate());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (call) {
      setRemarks('');
      setShowDatePicker(false);

      setFollowUpDate(moment().add(1, 'day').hour(9).minute(0).second(0).millisecond(0).toDate());
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
    if (selectedResponse.RemarkRequired && remarks.trim().length < 25) {
      Alert.alert(
        'Remarks required',
        'Please enter at least 25 characters in remarks.'
      );
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
      callDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
    });

    setSaving(true);
    try {
      const { data } = await axios.post(
        'https://studentapinew.university99.com/api/Lead/L01LeadResponse/update-lead-response',
        {
          leadId,
          responseId,
          manualFollowUpDateTime: followUpDate.toISOString(),
          callDate: moment().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]'),
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
          headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
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
      console.log(error);

      Alert.alert('Feedback not saved', error.response?.data?.message || error.message || 'Please try again.',);

    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const reopenLead = async () => {
    if (!leadId) {
      Alert.alert('Error', 'Lead ID not found.');
      return;
    }

    if (!reopenStageId) {
      Alert.alert('Select Stage', 'Please select reopen stage.');
      return;
    }

    if (!reopenRemark.trim()) {
      Alert.alert('Remark Required', 'Please enter remark.');
      return;
    }

    try {
      setSaving(true);

      const { data } = await axios.post(
        'https://studentapinew.university99.com/api/Lead/L01LeadResponse/reopen-lead',
        {
          leadId: leadId,
          reopenToStageId: reopenStageId,
          remark: reopenRemark.trim(),
          actionBy: Number(user?.userId) || null,
          ipAddress: null,
        },
        {
          timeout: 20000,
          headers: user?.token
            ? { Authorization: `Bearer ${user.token}` }
            : {},
        },
      );

      if (data?.isSuccess === false) {
        throw new Error(data?.message || 'Unable to reopen lead.');
      }

      setShowReopenModal(false);

      showMessage({
        message: data?.message || 'Lead reopened successfully.',
        type: 'success',
        duration: 3000,
      });

      onClose();
    } catch (error: any) {
      Alert.alert(
        'Reopen failed',
        error.response?.data?.message ||
        error.message ||
        'Unable to reopen lead.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View>
    <Modal
      visible={Boolean(call)}
      transparent
      animationType="slide"
      onRequestClose={() => { }}>
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
            <Text style={styles.title}>{selectedLeadId ? 'Lead feedback For Leadid :' : 'Call feedback' + leadId}</Text>


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
            {selectedResponse?.FollowUpRequired && <View>
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
            </View>}
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
              <Pressable
                disabled={saving || !leadId}
                style={[
                  styles.reopenButton,
                  (saving || !leadId) && styles.disabledButton,
                ]}
                onPress={async () => {
                  setReopenStageId(null);
                  setReopenRemark('');
                  await loadStages();
                  setShowReopenModal(true);
                }}>
                <Text style={styles.reopenText}>
                  {saving ? 'Please wait…' : 'Reopen Lead'}
                </Text>
              </Pressable>

              <Pressable
                disabled={saving || loadingResponses || !selectedResponse}
                style={[
                  styles.saveButton,
                  (saving || loadingResponses || !selectedResponse) &&
                  styles.disabledButton,
                ]}
                onPress={saveFeedback}>
                <Text style={styles.saveText}>
                  {saving ? 'Saving…' : 'Save feedback'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
    <Modal
  visible={showReopenModal}
  transparent
  animationType="fade"
  onRequestClose={() => setShowReopenModal(false)}>

  <View style={styles.reopenOverlay}>
    <View style={styles.reopenModal}>

      <Text style={styles.reopenTitle}>Reopen Lead</Text>

      <Text style={styles.label}>Stage</Text>

      <View style={styles.input}>
        <Picker
          selectedValue={reopenStageId}
          onValueChange={value =>
            setReopenStageId(value == null ? null : Number(value))
          }>
          <Picker.Item label="Select stage" value={null} />

          {stages.map(item => (
            <Picker.Item
              key={String(item.id)}
              label={item.statusName}
              value={Number(item.id)}
            />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Remark</Text>

      <TextInput
        style={[styles.input, styles.remarks]}
        placeholder="Enter reopen remark"
        multiline
        value={reopenRemark}
        onChangeText={setReopenRemark}
      />

      <View style={styles.actions}>

        <Pressable
          style={styles.cancelButton}
          disabled={saving}
          onPress={() => setShowReopenModal(false)}>
          <Text style={styles.cancelText}>Cancel</Text>
        </Pressable>

        <Pressable
          style={[
            styles.saveButton,
            (saving || !reopenStageId || !reopenRemark.trim()) &&
              styles.disabledButton,
          ]}
          disabled={
            saving || !reopenStageId || !reopenRemark.trim()
          }
          onPress={reopenLead}>
          <Text style={styles.saveText}>
            {saving ? 'Reopening...' : 'Reopen'}
          </Text>
        </Pressable>

      </View>
    </View>
  </View>
</Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0, right: 0
  },
  closeText: { fontSize: 30, color: '#333' },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  card: {
    maxHeight: '80%',
    padding: 22,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#1b1b1b' },
  subtitle: { marginTop: 4, marginBottom: 10, color: '#666' },
  label: { marginTop: 0, marginBottom: 7, fontWeight: '600', color: '#333' },
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
  disabledInput: { backgroundColor: '#f3f4f6', color: '#555' },
  remarks: { height: 90, paddingTop: 12, textAlignVertical: 'top' },
  statusList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#d8d8d8',
    borderRadius: 18,
  },
  selectedStatus: { backgroundColor: '#2856d8', borderColor: '#2856d8' },
  statusText: { color: '#444' },
  selectedStatusText: { color: '#fff' },
  dateText: { color: '#222' },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 10,
  },
  cancelText: { fontWeight: '600', color: '#555' },
  saveButton: {
    flex: 2,
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#2856d8',
    borderRadius: 10,
  },
  saveText: { fontWeight: '700', color: '#fff' },
  reopenButton: {
    flex: 1,
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: '#2856d8',
    borderRadius: 10,
    backgroundColor: '#fff',
  },

  reopenText: {
    fontWeight: '700',
    color: '#2856d8',
  },
  disabledButton: {
    opacity: 0.5,
  },
  reopenOverlay: {
  flex: 1,
  justifyContent: 'center',
  padding: 20,
  backgroundColor: 'rgba(0,0,0,0.5)',
},

reopenModal: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 16,
},

reopenTitle: {
  fontSize: 20,
  fontWeight: '700',
  marginBottom: 18,
  color: '#222',
},
});

export default CallFeedbackModal;
