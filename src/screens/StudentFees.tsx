import React, {useState} from 'react';
import {
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Picker} from '@react-native-picker/picker';
import {RootState} from '../redux/store';
import {feeBalance, feeTotals, previewInstallments} from '../utils/StudentFees';

const money = (value: number) => `Rs ${value.toLocaleString('en-IN')}`;
const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}-${String(date.getDate()).padStart(2, '0')}`;

function AmountRow({label, value}: {label: string; value: number}) {
  return (
    <View style={styles.amountRow}>
      <Text style={styles.small}>{label}</Text>
      <Text style={styles.small}>{money(value)}</Text>
    </View>
  );
}

export default function StudentFees() {
  const navigation = useNavigation();
  const user = useSelector((state: RootState) => state.user.userInfo);
  const [preview, setPreview] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [dueOnly, setDueOnly] = useState(true);
  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [sheet, setSheet] = useState<'history' | 'review' | null>(null);
  const student = Number(user?.entityTypeId) === 1;
  const fees = preview ? previewInstallments : [];
  const total = feeTotals(fees);
  const visible = fees.filter(
    fee => !dueOnly || (feeBalance(fee) > 0 && fee.dueDate <= dateKey(date)),
  );
  const payable = visible.filter(fee => feeBalance(fee) > 0);
  const chosen = payable.filter(fee => selected.includes(fee.id));
  const selectedTotal = chosen.reduce((sum, fee) => sum + feeBalance(fee), 0);
  const allSelected = payable.length > 0 && chosen.length === payable.length;
  const overdue = fees
    .filter(fee => fee.dueDate < dateKey(new Date()))
    .reduce((sum, fee) => sum + feeBalance(fee), 0);
  const academicStart =
    new Date().getMonth() >= 3
      ? new Date().getFullYear()
      : new Date().getFullYear() - 1;
  const year = preview
    ? '2026-27'
    : `${academicStart}-${String(academicStart + 1).slice(-2)}`;
  const toggle = (id: string) =>
    setSelected(ids =>
      ids.includes(id) ? ids.filter(value => value !== id) : [...ids, id],
    );

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="Go back"
          style={styles.iconButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={22} color="#202c40" />
        </TouchableOpacity>
        <Text style={styles.heading}>Fee Payment</Text>
        {student && (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setSheet('history')}>
            <Text style={styles.link}>History</Text>
          </TouchableOpacity>
        )}
      </View>
      {!student ? (
        <View style={styles.empty}>
          <Text style={styles.heading}>Student login required</Text>
          <Text style={styles.muted}>
            Sign in with your student account to view your fees.
          </Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.section}>
              <Text style={styles.badge}>Regular fee</Text>
            </View>
            <View style={styles.profile}>
              <Text style={styles.studentName}>
                {user?.userName || user?.AgentName || 'Student'}
              </Text>
              <View style={styles.detail}>
                <Icon name="book-open" size={13} color="#3986ad" />
                <Text style={styles.small}>
                  {user?.className || 'Class unavailable'}
                </Text>
              </View>
              <View style={styles.detail}>
                <Icon name="phone" size={13} color="#3986ad" />
                <Text style={styles.small}>
                  {user?.number || 'Phone unavailable'}
                </Text>
              </View>
              <View style={styles.detail}>
                <Icon name="credit-card" size={13} color="#3986ad" />
                <Text style={styles.small}>
                  {user?.admissionNumber || 'Admission number unavailable'}
                </Text>
              </View>
              <View style={styles.yearField}>
                <Text style={styles.fieldLabel}>Academic Year</Text>
                <Picker
                  selectedValue={year}
                  enabled={false}
                  style={styles.picker}>
                  <Picker.Item label={year} value={year} />
                </Picker>
              </View>
            </View>
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                {preview
                  ? 'DESIGN PREVIEW · Sample amounts, not your student balance.'
                  : 'Your fee account is not connected yet. Actual balances will appear once the fees service is available.'}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => {
                  setPreview(!preview);
                  setSelected([]);
                }}>
                <Text style={styles.link}>
                  {preview ? 'Close preview' : 'Preview fee layout'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.summary}>
              <LinearGradient
                colors={['#8560cf', '#49a8ce']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.gradient}>
                {[
                  [
                    'Total Payable ((F-C)+(T))',
                    total.fees - total.concession + total.tax,
                  ],
                  ['Amount Paid', total.paid],
                  ['Total Dues (OF + UD)', total.balance],
                  ['Bad Debt', 0],
                ].map(([label, value]) => (
                  <View key={label} style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>{label}</Text>
                    <Text style={styles.summaryValue}>
                      {preview ? money(Number(value)) : '—'}
                    </Text>
                  </View>
                ))}
              </LinearGradient>
              {expanded && (
                <>
                  <View style={styles.group}>
                    {preview ? (
                      <>
                        <AmountRow label="•  Fees (F)" value={total.fees} />
                        <AmountRow
                          label="•  Concession (C)"
                          value={total.concession}
                        />
                        <AmountRow label="•  Tax (T)" value={total.tax} />
                      </>
                    ) : (
                      <Text style={styles.muted}>
                        Fee breakdown unavailable
                      </Text>
                    )}
                  </View>
                  {preview && (
                    <>
                      <View style={styles.group}>
                        <AmountRow
                          label="•  Overdue Fees (OF)"
                          value={overdue}
                        />
                        <AmountRow
                          label="•  Upcoming Dues (UD)"
                          value={total.balance - overdue}
                        />
                        <AmountRow
                          label="•  Previous Session Dues (PSD)"
                          value={0}
                        />
                      </View>
                      <View style={styles.group}>
                        <AmountRow label="•  Total Fine" value={total.fine} />
                        <AmountRow label="•  Fine written off" value={0} />
                        <AmountRow label="•  Paid Fine" value={0} />
                        <AmountRow label="•  Balance Fine" value={total.fine} />
                      </View>
                    </>
                  )}
                </>
              )}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={{expanded}}
                style={styles.collapse}
                onPress={() => setExpanded(!expanded)}>
                <Text style={styles.muted}>{expanded ? 'Less' : 'More'}</Text>
                <Icon
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  color="#737984"
                />
              </TouchableOpacity>
            </View>
            <View style={styles.filters}>
              {[false, true].map(value => (
                <TouchableOpacity
                  key={String(value)}
                  accessibilityRole="button"
                  accessibilityState={{selected: dueOnly === value}}
                  style={[styles.chip, dueOnly === value && styles.activeChip]}
                  onPress={() => {
                    setDueOnly(value);
                    setSelected([]);
                  }}>
                  <Text style={dueOnly === value ? styles.white : styles.small}>
                    {value ? 'Due Till' : 'All'}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                accessibilityLabel="Choose due date"
                style={styles.date}
                onPress={() => setShowDate(true)}>
                <Text style={styles.small}>{dateKey(date)}</Text>
                <Icon name="calendar" size={14} color="#0866ff" />
              </TouchableOpacity>
            </View>
            {showDate && (
              <View>
                {
                  <DateTimePicker
                    value={date}
                    mode="date"
                    onChange={(_, next) => {
                      setShowDate(Platform.OS === 'ios');
                      if (next) {
                        setDate(next);
                        setSelected([]);
                      }
                    }}
                  />
                }
                {Platform.OS === 'ios' && (
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => setShowDate(false)}>
                    <Text style={styles.link}>Done</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
            <TouchableOpacity
              accessibilityRole="checkbox"
              accessibilityState={{
                checked: allSelected,
                disabled: !payable.length,
              }}
              disabled={!payable.length}
              style={styles.selectAll}
              onPress={() =>
                setSelected(allSelected ? [] : payable.map(fee => fee.id))
              }>
              <Icon
                name={allSelected ? 'check-square' : 'square'}
                size={20}
                color="#8090a5"
              />
              <Text style={styles.small}>Select All</Text>
            </TouchableOpacity>
            {visible.map(fee => (
              <View key={fee.id} style={styles.feeCard}>
                <TouchableOpacity
                  accessibilityRole="checkbox"
                  accessibilityLabel={`Select ${fee.title} installment ${fee.id}`}
                  accessibilityState={{
                    checked: selected.includes(fee.id),
                    disabled: feeBalance(fee) === 0,
                  }}
                  disabled={feeBalance(fee) === 0}
                  style={styles.installment}
                  onPress={() => toggle(fee.id)}>
                  <Icon
                    name={selected.includes(fee.id) ? 'check-square' : 'square'}
                    size={20}
                    color={selected.includes(fee.id) ? '#0866ff' : '#a7acb3'}
                  />
                  <Text style={styles.small}>{fee.id}</Text>
                </TouchableOpacity>
                <View style={styles.cardBody}>
                  <View style={styles.amountRow}>
                    <Text style={styles.feeTitle}>{fee.title}</Text>
                    <Text style={styles.status}>
                      {feeBalance(fee) === 0
                        ? 'Paid'
                        : fee.paid > 0
                        ? 'Partially paid'
                        : 'Unpaid'}
                    </Text>
                  </View>
                  <Text style={styles.dueLabel}>Due Date:</Text>
                  <Text style={styles.small}>
                    {fee.dueDate.split('-').reverse().join('-')}
                  </Text>
                  <View style={styles.metrics}>
                    {[
                      ['Fees', fee.fees],
                      ['Paid', fee.paid],
                      ['Balance', feeBalance(fee)],
                    ].map(([label, value]) => (
                      <View key={label} style={styles.metric}>
                        <Text style={styles.small}>{label}</Text>
                        <Text style={styles.metricValue}>
                          {money(Number(value))}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <AmountRow label="Fine" value={fee.fine} />
                  <AmountRow label="Concession" value={fee.concession} />
                </View>
              </View>
            ))}
            {!visible.length && (
              <View style={styles.empty}>
                <Icon name="file-text" size={28} color="#8a97ab" />
                <Text style={styles.feeTitle}>
                  {preview
                    ? 'No fees for this filter'
                    : 'Fee details unavailable'}
                </Text>
                <Text style={styles.muted}>
                  {preview
                    ? 'Choose All or adjust the due date.'
                    : 'Your school’s fee records have not been loaded.'}
                </Text>
              </View>
            )}
          </ScrollView>
          <View style={styles.footer}>
            <View>
              <Text style={styles.muted}>
                {chosen.length} installment(s) selected
              </Text>
              <Text style={styles.heading}>{money(selectedTotal)}</Text>
            </View>
            <TouchableOpacity
              disabled={!chosen.length}
              style={[styles.payButton, !chosen.length && styles.disabled]}
              onPress={() => setSheet('review')}>
              <Text style={styles.payText}>Review payment</Text>
              <Icon name="arrow-right" size={17} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}
      <Modal
        visible={sheet !== null && student}
        transparent
        animationType="slide"
        onRequestClose={() => setSheet(null)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.amountRow}>
              <Text style={styles.heading}>
                {sheet === 'history' ? 'Payment history' : 'Review payment'}
              </Text>
              <TouchableOpacity
                accessibilityLabel="Close"
                style={styles.iconButton}
                onPress={() => setSheet(null)}>
                <Icon name="x" size={22} color="#202c40" />
              </TouchableOpacity>
            </View>
            {sheet === 'review' && (
              <>
                <Text style={styles.noticeText}>
                  DESIGN PREVIEW · No payment will be processed.
                </Text>
                {chosen.map(fee => (
                  <AmountRow
                    key={fee.id}
                    label={`${fee.title} · ${fee.id}`}
                    value={feeBalance(fee)}
                  />
                ))}
                <AmountRow label="Total selected" value={selectedTotal} />
              </>
            )}
            <Text style={styles.sheetMessage}>
              {sheet === 'history'
                ? 'Payment history is not connected yet. Your receipts will appear here when the fees service is available.'
                : 'Online payment is not connected yet. Contact your school for the available payment methods.'}
            </Text>
            <TouchableOpacity
              style={styles.payButton}
              onPress={() => setSheet(null)}>
              <Text style={styles.payText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: '#f2f5fc'},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e3e6ed',
    paddingHorizontal: 8,
    minHeight: 56,
  },
  iconButton: {padding: 12},
  heading: {fontSize: 17, fontWeight: '600', color: '#202c40', flexShrink: 1},
  link: {color: '#0866ff', fontSize: 12, fontWeight: '500'},
  content: {paddingBottom: 20},
  section: {padding: 12, alignItems: 'flex-start'},
  badge: {
    backgroundColor: '#0866ff',
    color: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 7,
    fontSize: 12,
  },
  profile: {
    backgroundColor: '#e9f7ff',
    padding: 14,
    borderBottomWidth: 1,
    borderColor: '#d5e2eb',
  },
  studentName: {fontSize: 16, color: '#202c40', marginBottom: 12},
  detail: {flexDirection: 'row', gap: 8, alignItems: 'center', marginBottom: 9},
  small: {fontSize: 12, color: '#263349'},
  yearField: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#dedfe3',
    borderRadius: 5,
    backgroundColor: '#fff',
  },
  fieldLabel: {
    position: 'absolute',
    top: -9,
    left: 12,
    backgroundColor: '#e9f7ff',
    color: '#737984',
    fontSize: 10,
    paddingHorizontal: 4,
  },
  picker: {height: 50, color: '#263349'},
  notice: {margin: 12, gap: 8},
  noticeText: {fontSize: 12, color: '#685325', lineHeight: 18},
  summary: {
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#d9dce2',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    elevation: 1,
  },
  gradient: {padding: 10, borderRadius: 4, marginBottom: 4},
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  summaryLabel: {fontSize: 12, color: '#fff', flexShrink: 1},
  summaryValue: {
    fontSize: 12,
    color: '#fff',
    backgroundColor: '#ffffff22',
    borderRadius: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  group: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e3e3e6',
    borderRadius: 7,
    padding: 8,
    marginTop: 9,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  collapse: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 12,
    paddingTop: 14,
    paddingBottom: 4,
  },
  muted: {fontSize: 12, color: '#737984', lineHeight: 18},
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 10,
    padding: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#e0e3e8',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  activeChip: {backgroundColor: '#0866ff', borderColor: '#0866ff'},
  white: {color: '#fff', fontSize: 12},
  date: {
    backgroundColor: '#fff',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e3e8',
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  selectAll: {flexDirection: 'row', alignItems: 'center', gap: 9, padding: 14},
  feeCard: {marginHorizontal: 12, marginBottom: 12},
  installment: {
    flexDirection: 'row',
    gap: 9,
    alignItems: 'center',
    paddingVertical: 6,
  },
  cardBody: {backgroundColor: '#fff', borderRadius: 6, padding: 12},
  feeTitle: {fontSize: 15, color: '#202c40', fontWeight: '600'},
  status: {fontSize: 12, color: '#009e9e'},
  dueLabel: {fontSize: 10, color: '#737984', marginTop: 14, marginBottom: 3},
  metrics: {
    flexDirection: 'row',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e1e2e6',
    borderRadius: 4,
    paddingVertical: 12,
    marginVertical: 10,
  },
  metric: {flex: 1, alignItems: 'center', gap: 3},
  metricValue: {fontSize: 12, fontWeight: '500', color: '#202c40'},
  empty: {padding: 24, alignItems: 'center', gap: 12},
  footer: {
    padding: 14,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#e0e3e8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  payButton: {
    backgroundColor: '#0866ff',
    borderRadius: 6,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  payText: {color: '#fff', fontSize: 13, fontWeight: '600'},
  disabled: {backgroundColor: '#a7b9d3'},
  overlay: {flex: 1, justifyContent: 'flex-end', backgroundColor: '#15223866'},
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 36,
    gap: 12,
  },
  sheetMessage: {color: '#737984', fontSize: 14, lineHeight: 22},
});
