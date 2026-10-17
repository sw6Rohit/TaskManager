import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import moment from 'moment';
import Icon from 'react-native-vector-icons/Feather';

const ENDPOINT =
  'https://studentapinew.university99.com/api/Lead/L01LeadResponse/get-lead-timeline';
const PAGE_SIZE = 20;

type Entry = {
  StageTransactionId: number;
  FromStageName?: string;
  ToStageName?: string;
  ResponseName?: string;
  MoveType?: string;
  AttemptCount?: number;
  MaxAttemptCount?: number | null;
  LimitReached?: boolean;
  NextFollowUpDateTime?: string | null;
  FinalRemark?: string | null;
  ManualRemark?: string | null;
  SystemRemark?: string | null;
  ActionBy?: number;
  ActionAt?: string;
  IsSystemAction?: boolean;
  IsReverted?: boolean;
  RevertReason?: string | null;
  TimelineStatus?: string;
  TotalRecords?: number;
};

type Props = {
  lead: {leadId: number; name: string; code: string};
  token?: string;
  onClose: () => void;
};

const formatDate = (value: string | null | undefined, format: string) => {
  const date = moment(value, moment.ISO_8601, true);
  return value && date.isValid() ? date.format(format) : 'Date unavailable';
};

export default function LeadHistoryModal({lead, token, onClose}: Props) {
  const [page, setPage] = useState(1);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setEntries([]);
    const load = async () => {
      try {
        const {data: body} = await axios.post(
          ENDPOINT,
          {leadId: lead.leadId, pageNo: page, pageSize: PAGE_SIZE},
          {
            timeout: 20000,
            signal: controller.signal,
            headers: token ? {Authorization: `Bearer ${token}`} : {},
          },
        );
        if (body?.isSuccess === false)
          {throw new Error(body.message || 'Unable to load lead history.');}
        if (!Array.isArray(body?.data))
          {throw new Error('Unexpected lead history response.');}
        const count = Number(
          body.totalRecords ?? body.data[0]?.TotalRecords ?? body.data.length,
        );
        if (!Number.isFinite(count) || count < 0)
          {throw new Error('Unexpected history record count.');}
        if (!controller.signal.aborted) {
          setEntries(body.data);
          setTotal(count);
        }
      } catch (failure: any) {
        if (!controller.signal.aborted)
          {setError(
            failure?.response?.data?.message ||
              failure.message ||
              'Unable to load lead history.',
          );}
      } finally {
        if (!controller.signal.aborted) {setLoading(false);}
      }
    };
    load();
    return () => controller.abort();
  }, [lead.leadId, page, token, retry]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.heading}>
              <Text style={styles.title}>Lead History</Text>
              <Text style={styles.muted}>
                {lead.code === '—' ? `Lead #${lead.leadId}` : lead.code} ·{' '}
                {lead.name}
              </Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close lead history"
              onPress={onClose}
              style={styles.close}>
              <Icon name="x" size={20} color="#667085" />
            </TouchableOpacity>
          </View>
          <ScrollView
            key={`${lead.leadId}-${page}-${retry}`}
            contentContainerStyle={styles.content}>
            {loading ? (
              <View style={styles.state}>
                <ActivityIndicator color="#6C4CF1" />
                <Text style={styles.muted}>Loading history…</Text>
              </View>
            ) : error ? (
              <View style={styles.state}>
                <Text style={styles.error}>{error}</Text>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => setRetry(value => value + 1)}
                  style={styles.pageButton}>
                  <Text style={styles.link}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : entries.length === 0 ? (
              <View style={styles.state}>
                <Icon name="clock" size={32} color="#98A2B3" />
                <Text style={styles.muted}>
                  No history found for this lead.
                </Text>
              </View>
            ) : (
              entries.map((entry, index) => {
                const date = formatDate(entry.ActionAt, 'ddd, DD MMM, YYYY');
                const previousDate =
                  index > 0
                    ? formatDate(
                        entries[index - 1].ActionAt,
                        'ddd, DD MMM, YYYY',
                      )
                    : null;
                const reverted =
                  entry.IsReverted || entry.TimelineStatus === 'REVERTED';
                return (
                  <View key={entry.StageTransactionId}>
                    {date !== previousDate && (
                      <Text style={styles.date}>{date}</Text>
                    )}
                    <View style={styles.timeline}>
                      <View style={styles.dot} />
                      <View style={styles.card}>
                        <View style={styles.row}>
                          <Text style={styles.response}>
                            {entry.ResponseName || 'Stage update'}
                          </Text>
                          <Text style={styles.time}>
                            {formatDate(entry.ActionAt, 'hh:mm a')}
                          </Text>
                        </View>
                        <Text style={styles.stage}>
                          {entry.FromStageName || '—'} →{' '}
                          {entry.ToStageName || '—'}
                          {entry.MoveType ? ` · ${entry.MoveType}` : ''}
                        </Text>
                        {(entry.TimelineStatus || reverted) && (
                          <View
                            style={[
                              styles.badge,
                              reverted && styles.revertedBadge,
                            ]}>
                            <Text
                              style={[
                                styles.badgeText,
                                reverted && styles.revertedText,
                              ]}>
                              {reverted ? 'REVERTED' : entry.TimelineStatus}
                            </Text>
                          </View>
                        )}
                        <Text selectable style={styles.remark}>
                          {entry.FinalRemark ||
                            entry.ManualRemark ||
                            entry.SystemRemark ||
                            'No remark added.'}
                        </Text>
                        {entry.NextFollowUpDateTime && (
                          <Text style={styles.stage}>
                            Follow-up:{' '}
                            {formatDate(
                              entry.NextFollowUpDateTime,
                              'DD MMM YYYY, hh:mm a',
                            )}
                          </Text>
                        )}
                        {reverted && entry.RevertReason && (
                          <Text style={styles.error}>
                            Reason: {entry.RevertReason}
                          </Text>
                        )}
                        <Text style={styles.meta}>
                          Attempt {entry.AttemptCount ?? 0}
                          {entry.MaxAttemptCount != null
                            ? ` / ${entry.MaxAttemptCount}`
                            : ''}
                          {entry.LimitReached ? ' · Limit reached' : ''} ·{' '}
                          {entry.IsSystemAction
                            ? 'System'
                            : `By: ${entry.ActionBy ?? '—'}`}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
          <View style={styles.footer}>
            <Text style={styles.muted}>
              Page {page} of {pages} · {total} records
            </Text>
            <View style={styles.controls}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Previous history page"
                disabled={loading || !!error || page <= 1}
                onPress={() => setPage(value => value - 1)}
                style={[
                  styles.pageButton,
                  (loading || !!error || page <= 1) && styles.disabled,
                ]}>
                <Icon name="chevron-left" size={17} color="#6C4CF1" />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Next history page"
                disabled={loading || !!error || page >= pages}
                onPress={() => setPage(value => value + 1)}
                style={[
                  styles.pageButton,
                  (loading || !!error || page >= pages) && styles.disabled,
                ]}>
                <Icon name="chevron-right" size={17} color="#6C4CF1" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: 'rgba(15,23,42,0.5)',
  },
  modal: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '85%',
    alignSelf: 'center',
    backgroundColor: '#FFF',
    borderRadius: 18,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    backgroundColor: '#F7F5FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E3F2',
  },
  heading: {flex: 1, gap: 4},
  title: {fontSize: 19, fontWeight: '700', color: '#182230'},
  muted: {fontSize: 12, color: '#667085'},
  close: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  content: {padding: 18},
  state: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  error: {fontSize: 12, color: '#B42318'},
  date: {
    fontSize: 13,
    fontWeight: '700',
    color: '#344054',
    marginBottom: 14,
    marginTop: 4,
  },
  timeline: {
    borderLeftWidth: 2,
    borderLeftColor: '#DDD6FE',
    marginLeft: 7,
    paddingLeft: 18,
    paddingBottom: 18,
  },
  dot: {
    position: 'absolute',
    top: 10,
    left: -8,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#6C4CF1',
    borderWidth: 2,
    borderColor: '#F0ECFF',
  },
  card: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8E3F2',
    borderRadius: 12,
    gap: 9,
  },
  row: {flexDirection: 'row', gap: 8, alignItems: 'flex-start'},
  response: {flex: 1, fontSize: 14, fontWeight: '700', color: '#182230'},
  time: {fontSize: 11, color: '#667085'},
  stage: {fontSize: 12, color: '#5B3FD3'},
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    backgroundColor: '#ECFDF3',
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: {fontSize: 10, fontWeight: '700', color: '#027A48'},
  revertedBadge: {backgroundColor: '#FFF1F0'},
  revertedText: {color: '#B42318'},
  remark: {fontSize: 13, lineHeight: 20, color: '#344054'},
  meta: {fontSize: 11, color: '#667085'},
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F0F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  controls: {flexDirection: 'row', gap: 8},
  pageButton: {
    minWidth: 40,
    minHeight: 40,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: '#F0ECFF',
  },
  disabled: {opacity: 0.35},
  link: {color: '#6C4CF1', fontWeight: '700'},
});
