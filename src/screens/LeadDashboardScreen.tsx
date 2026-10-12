import { rememberLeadCall, clearLeadCall } from '../utils/LeadCallContext';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Alert,
  Linking,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import { leadUpdateDate, wasLeadUpdatedToday } from '../utils/LeadStatus';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Feather';
import { leadDialNumber } from '../utils/LeadPhone';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import CallFeedbackModal, { DisconnectedCall } from '../components/CallFeedbackModal';
import moment from 'moment';

import { clearUser } from '../redux/slices/userSlice';
import { useNavigation } from '@react-navigation/native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

const ENDPOINT =
  'https://studentapinew.university99.com/api/Lead/L08LeadsByStage/operation';
const STAGE_ENDPOINT =
  'https://studentapinew.university99.com/api/Lead/M03Stage/operation';
const SOURCE_ENDPOINT =
  'https://studentapinew.university99.com/api/Lead/L07Source/operation';
const CAMPAIGN_ENDPOINT =
  'https://studentapinew.university99.com/api/lead/L07Source/dashboard-filters';
const PAGE_SIZE = 10;

const leadFieldValue = (item: Record<string, unknown>, aliases: string[]) => {
  for (const alias of aliases) {
    const exact = item[alias];
    if (exact != null && String(exact).trim() !== '') return exact;
    const entry = Object.entries(item).find(
      ([key, value]) =>
        value != null && String(value).trim() !== '' &&
        key.replace(/[^a-z0-9]/gi, '').toLowerCase() ===
        alias.replace(/[^a-z0-9]/gi, '').toLowerCase(),
    );
    if (entry && entry[1] != null && String(entry[1]).trim() !== '')
      return entry[1];
  }
  return '—';
};

const getSourceId = (item: any) =>
  Number(leadFieldValue(item, ['sourceId', 'id']));
const getCampaignId = (item: any): string | null => {
  const value = leadFieldValue(item, ['Id', 'referenceId', 'campaignId']);
  return value === '—' ? null : String(value).trim();
};

export const getSourceFilterMode = (source: any): 'CAMPAIGN' | 'REFERENCE' | null => {
  const campaignAllowed = source?.CampaignAllowed ?? source?.campaignAllowed;
  const referenceAllowed = source?.ReferenceAllowed ?? source?.referenceAllowed;
  if (campaignAllowed === true) return 'CAMPAIGN';
  if (referenceAllowed === true) return 'REFERENCE';
  if (campaignAllowed === false || referenceAllowed === false) return null;
  return 'CAMPAIGN';
};

const getSourceName = (item: any) =>
  String(
    item?.sourceName ??
    item?.SourceName ??
    item?.name ??
    item?.Name ??
    item?.description ??
    item?.Description ??
    `Source ${getSourceId(item)}`,
  );

const getCampaignName = (item: any) =>
  String(
    item?.referenceName ??
    item?.ReferenceName ??
    item?.campaignName ??
    item?.CampaignName ??
    item?.name ??
    item?.Name ??
    item?.description ??
    item?.Description ??
    `Campaign ${getCampaignId(item)}`,
  );

export const parseLeadResponse = (body: any) => {
  if (body?.isSuccess === false)
    throw new Error(body.message || 'Unable to load leads.');
  const data = body?.data ?? body;
  const rows = Array.isArray(data)
    ? data
    : data?.leads ?? data?.items ?? data?.records;
  if (!Array.isArray(rows))
    throw new Error('The server returned an unexpected lead-list format.');
  const count =
    data?.totalRecords ??
    data?.totalCount ??
    body?.totalRecords ??
    body?.totalCount;
  return { rows, total: count == null ? null : Number(count) };
};

export default function LeadDashboardScreen() {
  const user = useSelector((state: RootState) => state?.user?.userInfo);
  const loginUserId = Number(user?.userId);

    const userData = useSelector((state: RootState) => state?.user);
   const navigation= useNavigation()

  const dispatch = useDispatch();


  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reload, setReload] = useState(0);
  const [feedback, setFeedback] = useState<{
    leadId: number;
    call: DisconnectedCall;
  } | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [stages, setStages] = useState<any[]>([]);
  const [stageId, setStageId] = useState<number | null>(null);
  const [stagesLoading, setStagesLoading] = useState(true);
  const [stageError, setStageError] = useState('');
  const [stageReload, setStageReload] = useState(0);

  const [filterVisible, setFilterVisible] = useState(false);
  const [sources, setSources] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [sourceLoading, setSourceLoading] = useState(false);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    null,
  );
  const [tempSourceId, setTempSourceId] = useState<number | null>(null);
  const [tempCampaignId, setTempCampaignId] = useState<string | null>(null);
  const [selectedLeadType, setSelectedLeadType] = useState<string | null>(null);
  const [tempLeadType, setTempLeadType] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<'pending' | 'called'>('pending');
  const [loadedStageFilter, setLoadedStageFilter] = useState<string | undefined>();
  const leadFilter = selectedLeadType || 'all';
  const [today, setToday] = useState(() => moment().format());
  const [newestFirst, setNewestFirst] = useState(true);
  const [universityId, setUniversityId] = useState<number>(2);
const [universityDropdownOpen, setUniversityDropdownOpen] = useState(false);


useEffect(() => {
  navigation.setOptions({
    headerRight: () => (
      <TouchableOpacity
        onPress={() => setUniversityDropdownOpen(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: '#F4F0FF',
          borderWidth: 1,
          borderColor: '#DDD6FE',
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 8,
          marginRight: 12,
          gap: 7,
        }}
      >
        <Text style={{ color: '#5130B5', fontWeight: '700' }}>
          {universityId === 3 ? 'DDUGKY' : 'SCVT'}
        </Text>
        <Icon name="chevron-down" size={16} color="#5130B5" />
      </TouchableOpacity>
    ),
  });
}, [navigation, universityId]);
  const [leadFilterCounts, setLeadFilterCounts] = useState<any>({
  all: 0,
  newLead: 0,
  retry: 0,
  todayFollow: 0,
  comingUp: 0,
  overDue: 0,
});
const [fromDate, setFromDate] = useState( moment('2020-01-01').format('YYYY-MM-DD'));

const [toDate, setToDate] = useState(moment().add(7, 'days').format('YYYY-MM-DD'));
  const requestPageSize =
    selectedSourceId != null ||
    selectedCampaignId != null ||
    selectedLeadType ||
    search ||
    callStatus
      ? 99999
      : PAGE_SIZE;

  useEffect(() => {
    const timer = setInterval(() => setToday(moment().format()), 60000);
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        setToday(moment().format());
        setReload(value => value + 1);
      }
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, []);


  const statusRows = useMemo(() => {
    const called = rows.filter(item =>
      wasLeadUpdatedToday(leadFieldValue(item, ['Created_at']), today),
    );
    const pending = rows.filter(
      item => !wasLeadUpdatedToday(leadFieldValue(item, ['Created_at']), today),
    );
    const visible = [...(callStatus === 'called' ? called : pending)].sort(
      (a, b) => {
        const aTime =
          leadUpdateDate(leadFieldValue(a, ['Created_at']))?.getTime() ?? 0;
        const bTime =
          leadUpdateDate(leadFieldValue(b, ['Created_at']))?.getTime() ?? 0;
        return newestFirst ? bTime - aTime : aTime - bTime;
      },
    );
    return {called: called.length, pending: pending.length, visible};
  }, [rows, today, callStatus, newestFirst]);

  useEffect(() => {
    const controller = new AbortController();
    setStagesLoading(true);
    setStageError('');
    setStages([]);
    setStageId(null);
    setPage(1);

    const loadStages = async () => {
        console.log(universityId, loginUserId, leadFilter ,fromDate,toDate,tempSourceId?.toString(),tempCampaignId?.toString());

      try {
        if (!loginUserId) throw new Error('Please log in to view stages.');
        const { data: body } = await axios.post(
          STAGE_ENDPOINT,
          { type: 5,  id: universityId, loginUserId, leadFilter ,fromDate,toDate,sourceId:tempSourceId?.toString(),campaignId: tempCampaignId?.toString()},
          {
            timeout: 20000,
            signal: controller.signal,
            headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
          },
        );
        
       if (body?.isSuccess === false) {
  throw new Error(body.message || 'Unable to load stages.');
}

setLeadFilterCounts(body?.leadFilterCounts ?? {
  all: 0,
  newLead: 0,
  retry: 0,
  todayFollow: 0,
  comingUp: 0,
  overDue: 0,
});

const data = body?.data ?? body;
        const list = Array.isArray(data)
          ? data
          : data?.stages ?? data?.items ?? data?.records;
        if (!Array.isArray(list))
          throw new Error('Unexpected stage-list response.');
        const options = list
          .filter(item => Number(item.id) > 0)
          .sort(
            (a, b) =>
              Number(a.stageDisplayOrder ?? a.stage_Display_Order ?? 0) -
              Number(b.stageDisplayOrder ?? b.stage_Display_Order ?? 0),
          );
        if (!controller.signal.aborted) {
          setStages(options);
          setLoadedStageFilter(leadFilter);
          setStageId(
            options.length
              ? Number(
                (options.find(item => Number(item.id) === 18) || options[0])
                  .id,
              )
              : null,
          );
        }
      } catch (failure: any) {
        if (!controller.signal.aborted)
        {
          if(failure?.status ===401)
          {
            dispatch(clearUser());
          }
          else
          setStageError(failure.message || 'Unable to load stages.');
        }
      } finally {
        if (!controller.signal.aborted) setStagesLoading(false);
      }
    };

    loadStages();
    return () => controller.abort();
  }, [loginUserId, user?.token, stageReload, leadFilter, universityId,filterVisible]);

  const loadSources = async () => {
    try {
      if (!loginUserId) return;
      setSourceLoading(true);
      const { data: body } = await axios.post(
        SOURCE_ENDPOINT,
        { type: 5, loginUserId },
        {
          timeout: 20000,
          headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
        },
      );
      if (body?.isSuccess === false)
        throw new Error(body.message || 'Unable to load sources.');
      const data = body?.data ?? body;
      const list = Array.isArray(data)
        ? data
        : data?.sources ?? data?.items ?? data?.records ?? [];
      setSources(
        Array.isArray(list) ? list.filter(item => getSourceId(item) > 0) : [],
      );
    } catch (failure: any) {
      Alert.alert(
        'Source',
        failure?.response?.data?.message ||
        failure?.message ||
        'Unable to load sources.',
      );
    } finally {
      setSourceLoading(false);
    }
  };

  const loadCampaigns = async (sourceId: number | null) => {
    setCampaigns([]);
    if (!sourceId) return;
    const mode = getSourceFilterMode(sources.find(item => getSourceId(item) === sourceId));
    if (!mode) return;
    try {
      setCampaignLoading(true);
      const { data: body } = await axios.get(CAMPAIGN_ENDPOINT, {
        params: { mode, sourceId },
        timeout: 20000,
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
      });
      if (body?.isSuccess === false)
        throw new Error(body.message || 'Unable to load campaigns.');
      const data = body?.data ?? body;

      const list = data ?? [];
      setCampaigns(
        Array.isArray(list) ? list.filter(item => getCampaignId(item) !== null) : [],
      );
    } catch (failure: any) {
      Alert.alert(
        'Campaign',
        failure?.response?.data?.message ||
        failure?.message ||
        'Unable to load campaigns.',
      );
    } finally {
      setCampaignLoading(false);
    }
  };

  const openFilter = async () => {
    setTempSourceId(selectedSourceId);
    setTempCampaignId(selectedCampaignId);
    setTempLeadType(selectedLeadType);
    setFilterVisible(true);
    if (!sources.length) await loadSources();
    if (selectedSourceId) await loadCampaigns(selectedSourceId);
  };

  const applyFilters = () => {
    const campaign = campaigns.find(
      item => getCampaignId(item) === tempCampaignId,
    );
    const source = sources.find(item => getSourceId(item) === tempSourceId);
    const filterSearch = campaign
      ? getCampaignName(campaign)
      : source
        ? getSourceName(source)
        : '';
    setQuery(filterSearch);
    setSearch(filterSearch);
    setReload(value => value + 1);
    setSelectedSourceId(tempSourceId);
    setSelectedCampaignId(tempCampaignId);
    setSelectedLeadType(tempLeadType);
    setPage(1);
    setFilterVisible(false);
  };

  const clearFilters = () => {
    setQuery('');
    setSearch('');
    setTempSourceId(null);
    setTempCampaignId(null);
    setTempLeadType(null);
    setSelectedSourceId(null);
    setSelectedCampaignId(null);
    setSelectedLeadType(null);
    setCampaigns([]);
    setPage(1);
    setFilterVisible(false);
  };
  useEffect(() => {
    if (!userData.userInfo) {
      setLoading(false);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    }
  }, [userData]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setRows([]);
    setTotal(null);

    if (stageId == null || stagesLoading || loadedStageFilter !== leadFilter) {
      setLoading(false);
      return () => controller.abort();
    }

    const load = async () => {
      try {
        if (!loginUserId) throw new Error('Please log in to view leads.');
        const response = await axios.post(
          ENDPOINT,
          {
            stageId: stageId,
            universityId: 2,
            pageNumber: page,
            pageSize: requestPageSize,
            search: search || null,

            leadFilter,
          },
          {
            timeout: 20000,
            signal: controller.signal,
            headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {},
          },
        );

        const result = parseLeadResponse(response.data);
        if (!controller.signal.aborted) {
          setRows(result.rows);
          setTotal(result.total);
        }
      } catch (failure: any) {
        if (!controller.signal.aborted) {
          setError(
            failure.response?.status === 401
              ? 'Your session has expired. Please log in again.'
              : failure.message || 'Unable to load leads.',
          );
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    load();
    return () => controller.abort();
  }, [
    loginUserId,
    user?.token,
    page,
    search,
    reload,
    stageId,

    leadFilter,
    loadedStageFilter,
    stagesLoading,
    requestPageSize,
    fromDate,
  toDate,
  ]);

  const openDialer = async (number: string, lead: any) => {
    try {
      await rememberLeadCall(
        Number(leadFieldValue(lead, ['leadid', 'id'])),
        number,
      );
      await Linking.openURL(`tel:${number}`);
    } catch {
      await clearLeadCall();
      Alert.alert(
        'Unable to open dialer',
        'No phone app is available to call this number.',
      );
    }
  };
  const openFromDatePicker = () => {
  DateTimePickerAndroid.open({
    value: moment(fromDate, 'YYYY-MM-DD').toDate(),
    mode: 'date',
    maximumDate: moment(toDate, 'YYYY-MM-DD').toDate(),

    onChange: (event, selectedDate) => {
      if (event.type === 'set' && selectedDate) {
        setFromDate(moment(selectedDate).format('YYYY-MM-DD'));
      }
    },
  });
};

const openToDatePicker = () => {
  DateTimePickerAndroid.open({
    value: moment(toDate, 'YYYY-MM-DD').toDate(),
    mode: 'date',
    minimumDate: moment(fromDate, 'YYYY-MM-DD').toDate(),

    onChange: (event, selectedDate) => {
      if (event.type === 'set' && selectedDate) {
        setToDate(moment(selectedDate).format('YYYY-MM-DD'));
      }
    },
  });
};

  const submitSearch = () => {
    setPage(1);
    setSearch(query.trim());
  };

  const nextDisabled =
    loading ||
    !!error ||
    (total != null
      ? page * requestPageSize >= total
      : rows.length < requestPageSize);

  const activeFilterCount =
    (selectedSourceId ? 1 : 0) +
    (selectedCampaignId ? 1 : 0) +
    (selectedLeadType ? 1 : 0);

  const sourceFilterMode = getSourceFilterMode(
    sources.find(item => getSourceId(item) === tempSourceId),
  );
  const sourceFilterLabel = sourceFilterMode === 'REFERENCE' ? 'Reference' : 'Campaign';

  return (
    <View style={styles.container}>
      <View style={styles.typeTabs}>
        {[
  {
    label: 'New',
    value: 'newLead',
    count: leadFilterCounts.newLead,
    color: '#EEF0FF',
  },
  {
    label: 'Retry',
    value: 'retry',
    count: leadFilterCounts.retry,
    color: '#d8dbf3',
  },
  {
    label: 'Today',
    value: 'todayFollow',
    count: leadFilterCounts.todayFollow,
    color: '#F1F0FA',
  },
  {
    label: 'Later',
    value: 'comingUp',
    count: leadFilterCounts.comingUp,
    color: '#FFF4E2',
  },
  {
    label: 'Overdue',
    value: 'overDue',
    count: leadFilterCounts.overDue,
    color: '#FFF0F3',
  },
].map(option => (
          <TouchableOpacity
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedLeadType === option.value }}
            style={[
              styles.typeTab,
              { backgroundColor: option.color },
              selectedLeadType === option.value && styles.typeTabSelected,
            ]}
            onPress={() => {
              setSelectedLeadType(
                selectedLeadType === option.value ? null : option.value,
              );
              setPage(1);
            }}>
            <Text
              style={[
                styles.radioText,
                selectedLeadType === option.value && styles.radioTextSelected,
              ]}>
              {option.label} ({option.count ?? 0})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.statusTabs}>
        {(['pending', 'called'] as const).map(status => (
          <TouchableOpacity
            key={status}
            accessibilityRole="tab"
            accessibilityLabel={
              status === 'called' ? 'Called leads' : 'Pending leads'
            }
            accessibilityState={{selected: callStatus === status}}
            style={[
              styles.statusTab,
              callStatus === status && styles.statusTabSelected,
            ]}
            onPress={() => setCallStatus(status)}>
            <Text
              style={[
                styles.statusTabText,
                callStatus === status && styles.statusTabTextSelected,
              ]}>
              {status === 'called' ? 'Called' : 'Pending'} (
              {loading ? '…' : statusRows[status]})
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.topHeader}>
        {stagesLoading ? (
          <ActivityIndicator color="#6C4CF1" />
        ) : stageError ? (
          <View>
            <Text style={styles.error}>{stageError}</Text>
            <TouchableOpacity
              onPress={() => setStageReload(value => value + 1)}>
              <Text style={styles.subtitle}>Retry loading stages</Text>
            </TouchableOpacity>
          </View>
        ) : stages.length ? (
          <View style={styles.stagePicker}>
            <Picker
              selectedValue={stageId}
              accessibilityLabel="Lead stage"
              onValueChange={value => {
                setPage(1);
                setStageId(Number(value));
              }}>
              {stages.map(stage => (
                <Picker.Item
                  key={String(stage.id)}
                  label={`${stage.statusName || stage.stageDescription || 'Stage'
                    }${stage.leadCount != null ? ` (${stage.leadCount})` : ''}`}
                  value={Number(stage.id)}
                />
              ))}
            </Picker>
          </View>
        ) : (
          <Text style={styles.subtitle}>No stages available.</Text>
        )}
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilterCount > 0 && styles.filterButtonActive,
          ]}
          onPress={clearFilters}>
          <Icon
            name="x"
            size={17}
            color={activeFilterCount > 0 ? '#FFF' : '#6C4CF1'}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilterCount > 0 && styles.filterButtonActive,
          ]}
          onPress={openFilter}>
          <Icon
            name="filter"
            size={17}
            color={activeFilterCount > 0 ? '#FFF' : '#6C4CF1'}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          placeholder="Search leads (name, mobile, code...)"
          placeholderTextColor="#667085"
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={submitSearch}
          returnKeyType="search"
        />

        <TouchableOpacity style={styles.button} onPress={submitSearch}>
          <Icon name="search" size={22} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Previous page"
          accessibilityState={{ disabled: loading || page === 1 }}
          disabled={loading || page === 1}
          style={[
            styles.arrowButton,
            (loading || page === 1) && styles.disabled,
          ]}
          onPress={() => setPage(value => value - 1)}>
          <Icon name="chevron-left" size={22} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Next page"
          accessibilityState={{ disabled: nextDisabled }}
          disabled={nextDisabled}
          style={[styles.arrowButton, nextDisabled && styles.disabled]}
          onPress={() => setPage(value => value + 1)}>
          <Icon name="chevron-right" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator style={styles.loader} color="#6C4CF1" size="large" />
      ) : error ? (
        <View style={styles.loader}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setReload(value => value + 1)}>
            <Text style={styles.buttonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={statusRows.visible}
          keyExtractor={(item, index) =>
            String(item.leadId ?? item.LeadId ?? item.id ?? `${page}-${index}`)
          }
          refreshing={loading}
          onRefresh={() => setReload(value => value + 1)}
          ListEmptyComponent={<Text style={styles.empty}>No leads found.</Text>}
          renderItem={({ item }) => {
            const mobile1 = leadFieldValue(item, [
              'MobileNo1',
              'MobileNumber1',
              'MobileNo',
              'MobNo1',
              'MobNo',
              'mobile1',
              'mobilenumber',
              'phone1',
            ]);
            const mobile2 = leadFieldValue(item, [
              'MobileNo2',
              'MobileNumber2',
              'MobNo2',
              'mobile2',
              'alternatemobilenumber',
              'phone2',
            ]);
            const number1 =
              mobile1 !== '—' ? leadDialNumber('MobileNo1', mobile1) : null;
            const number2 =
              mobile2 !== '—' ? leadDialNumber('MobileNo2', mobile2) : null;

            const called = wasLeadUpdatedToday(
              leadFieldValue(item, ['CallDate']),
              today,
            );
            const created = leadUpdateDate(
              leadFieldValue(item, ['Created_at']),
            );
            const primaryNumber = number1 || number2;
            const details = [
              { label: 'Stage', value: leadFieldValue(item, ['stageName']) },
              {
                label: 'Response',
                value: leadFieldValue(item, ['responseName']),
              },
              {
                label: 'Next follow-up',
                value: leadFieldValue(item, [
                  'nextFollowUp',
                  'followUpDate',
                  'nextFollowUpDate',
                ]),
              },
              {
                label: 'Amount paid',
                value: leadFieldValue(item, ['totalAmountPaid']),
              },
              {
                label: 'SourceName',
                value: leadFieldValue(item, ['SourceName']),
              },
              {
                label: 'CampaignName',
                value: leadFieldValue(item, ['CampaignName']),
              },
              {
                label: 'Mentor Name',
                value: leadFieldValue(item, ['LeadUserName']),
              },
              {
                label: 'Remark',
                value: leadFieldValue(item, [
                  'currentRemark',
                  'currentRemarks',
                ]),
              },
            ];
            return (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.codeBlock}>
                    <Text selectable style={styles.leadCode}>
                      {String(
                        leadFieldValue(item, ['name', 'fullName', 'leadName']),
                      )}
                    </Text>
                  </View>

                  <View style={styles.contactRow}>
                    {[
                      { number: number1, display: mobile1 },
                    ].map((phone, index) =>
                      phone.display !== '—' ? (
                        <TouchableOpacity
                          key={index}
                          accessibilityRole="button"
                          accessibilityLabel={`Call ${String(phone.display)}`}
                          style={styles.phoneLink}
                          onPress={() => {
                            if (phone.number) {
                              openDialer(phone.number, item);
                            } else {
                              Alert.alert('Invalid phone number', `Please correct this lead's number: ${String(phone.display)}`);
                            }
                          }}>
                          <Icon name="phone" size={16} color="#15976D" />
                          <Text style={styles.mobileNumber}>
                            {String(phone.display)}
                          </Text>
                        </TouchableOpacity>
                      ) : null,
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      called ? styles.calledBadge : styles.pendingBadge,
                    ]}>
                    <Icon
                      name={called ? 'check-circle' : 'clock'}
                      size={14}
                      color={called ? '#13865F' : '#B66A00'}
                    />
                    <Text
                      style={[
                        styles.badgeText,
                        { color: called ? '#13865F' : '#B66A00' },
                      ]}>
                      {called ? 'Called' : 'Pend'}
                      {String('[' + leadFieldValue(item, ['lead_id'])) + ']'}
                    </Text>
                  </View>
                </View>

                {details
                  .filter(detail => detail.value !== '—')
                  .map(detail => (
                    <View key={detail.label} style={styles.detail}>
                      <Text style={styles.label}>{detail.label}</Text>
                      <Text selectable style={styles.value}>
                        {String(detail.value)}
                      </Text>
                    </View>
                  ))}
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Open WhatsApp"
                    disabled={!primaryNumber}
                    style={[
                      styles.whatsappButton,
                      !primaryNumber && styles.disabled,
                    ]}
                    onPress={async () => {
                      try {
                        await Linking.openURL(
                          `https://wa.me/${primaryNumber!.replace(/\D/g, '')}`,
                        );
                      } catch {
                        Alert.alert(
                          'Unable to open WhatsApp',
                          'Please try again.',
                        );
                      }
                    }}>
                    <Icon name="message-circle" size={16} color="#13865F" />
                    <Text style={styles.whatsappText}>WhatsApp</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={called ? 'Call again' : 'Call now'}
                    disabled={!primaryNumber}
                    style={[
                      styles.primaryCallButton,
                      !primaryNumber && styles.disabled,
                    ]}
                    onPress={() =>
                      primaryNumber && openDialer(primaryNumber, item)
                    }>
                    <Icon name="phone" size={16} color="#FFF" />
                    <Text style={styles.buttonText}>
                      {called ? 'Call Again' : 'Call Now'}
                    </Text>
                  </TouchableOpacity>
                  {user?.role_id === 1 &&<TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel="Response"
                    accessibilityHint="Open the lead feedback form"
                    style={styles.responseButton}
                    onPress={() => {
                      const leadId = Number(leadFieldValue(item, ['leadid', 'id']));
                      if (!Number.isFinite(leadId) || leadId <= 0) {
                        Alert.alert('Feedback unavailable', 'This lead has no valid lead ID.');
                        return;
                      }
                      setFeedback({
                        leadId,
                        call: {
                          phoneNumber: primaryNumber || '',
                          duration: 0,
                          callType: 'MANUAL',
                          timestamp: Date.now(),
                        },
                      });
                    }}>
                    <Icon name="clock" size={20} color="#713AF3" />
                  </TouchableOpacity>}
                </View>
              </View>
            );
          }}
        />
      )}
      {feedback && (
        <CallFeedbackModal
          call={feedback.call}
          selectedLeadId={feedback.leadId}
          onClose={() => {
            setFeedback(null);
            setReload(value => value + 1);
          }}
        />
      )}
      <Modal
        visible={filterVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setFilterVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <ScrollView
              bounces={false}
              contentContainerStyle={styles.filterContent}>
              <View style={styles.filterModalHeader}>
                <View style={styles.filterHeaderText}>
                  <Text style={styles.filterTitle}>Filter Leads</Text>

                  <View style={styles.dateFilterRow}>

  <TouchableOpacity
    style={styles.dateFilterBox}
    onPress={openFromDatePicker}>

    <Icon name="calendar" size={15} color="#6C4CF1" />

    <View>
      <Text style={styles.dateFilterLabel}>From</Text>
      <Text style={styles.dateFilterValue}>
        {moment(fromDate).format('DD MMM YYYY')}
      </Text>
    </View>

  </TouchableOpacity>

  <Icon name="arrow-right" size={16} color="#98A2B3" />

  <TouchableOpacity
    style={styles.dateFilterBox}
    onPress={openToDatePicker}>

    <Icon name="calendar" size={15} color="#6C4CF1" />

    <View>
      <Text style={styles.dateFilterLabel}>To</Text>
      <Text style={styles.dateFilterValue}>
        {moment(toDate).format('DD MMM YYYY')}
      </Text>
    </View>

  </TouchableOpacity>

</View>
                  <Text style={styles.filterSubtitle}>
                    Select source, campaign and lead type
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setFilterVisible(false)}>
                  <Icon name="x" size={21} color="#344054" />
                </TouchableOpacity>
              </View>

              <Text style={styles.filterLabel}>Source</Text>
              <View style={styles.filterPicker}>
                {sourceLoading ? (
                  <View style={styles.pickerLoading}>
                    <ActivityIndicator size="small" color="#6C4CF1" />
                    <Text style={styles.pickerLoadingText}>
                      Loading sources...
                    </Text>
                  </View>
                ) : (
                  <Picker
                    selectedValue={tempSourceId}
                    onValueChange={value => {
                      const id = value ? Number(value) : null;
                      setTempSourceId(id);
                      setTempCampaignId(null);
                      loadCampaigns(id);
                    }}>
                    <Picker.Item label="All Sources" value={null} />
                    {sources.map(source => (
                      <Picker.Item
                        key={String(getSourceId(source))}
                        label={getSourceName(source)}
                        value={getSourceId(source)}
                      />
                    ))}
                  </Picker>
                )}
              </View>

              <Text style={styles.filterLabel}>{sourceFilterLabel}</Text>
              <View
                style={[
                  styles.filterPicker,
                  (!tempSourceId || !sourceFilterMode) && styles.filterPickerDisabled,
                ]}>
                {campaignLoading ? (
                  <View style={styles.pickerLoading}>
                    <ActivityIndicator size="small" color="#6C4CF1" />
                    <Text style={styles.pickerLoadingText}>
                      Loading {sourceFilterLabel.toLowerCase()}s...
                    </Text>
                  </View>
                ) : (
                  <Picker
                    enabled={!!tempSourceId && !!sourceFilterMode}
                    selectedValue={tempCampaignId}
                    onValueChange={value =>
                      setTempCampaignId(value == null || value === '' ? null : String(value))
                    }>
                    <Picker.Item
                      label={
                        !tempSourceId ? 'Select Source first' : !sourceFilterMode
                          ? 'Not available for this source'
                          : `All ${sourceFilterLabel}s`
                      }
                      value={null}
                    />
                    {campaigns.map(campaign => (
                      <Picker.Item
                        key={String(getCampaignId(campaign))}
                        label={getCampaignName(campaign)}
                        value={getCampaignId(campaign)}
                      />
                    ))}
                  </Picker>
                )}
              </View>

              <View style={styles.filterFooter}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => {
                    setTempSourceId(null);
                    setTempCampaignId(null);
                    setTempLeadType(null);
                    setCampaigns([]);
                  }}>
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={applyFilters}>
                  <Icon name="check" size={17} color="#FFF" />
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
      <Modal
  visible={universityDropdownOpen}
  transparent
  animationType="fade"
  onRequestClose={() => setUniversityDropdownOpen(false)}
>
  <TouchableOpacity
    activeOpacity={1}
    onPress={() => setUniversityDropdownOpen(false)}
    style={{
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.2)',
      alignItems: 'flex-end',
      paddingTop: 65,
      paddingRight: 12,
    }}
  >
    <View
      style={{
        width: 170,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 6,
        elevation: 8,
      }}
    >
      {[
        { id: 3, name: 'DDUGKY' },
        { id: 2, name: 'SCVT' },
      ].map(item => (
        <TouchableOpacity
          key={item.id}
          onPress={() => {
            setUniversityDropdownOpen(false);

            if (universityId !== item.id) {
              setUniversityId(item.id);
              setStageId(null);
              setLoadedStageFilter(undefined);
              setSelectedLeadType(null);
              setSelectedSourceId(null);
              setSelectedCampaignId(null);
              setTempSourceId(null);
              setTempCampaignId(null);
              setQuery('');
              setSearch('');
              setPage(1);
            }
          }}
          style={{
            padding: 13,
            borderRadius: 8,
            backgroundColor:
              universityId === item.id ? '#F1EBFF' : '#FFF',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Text style={{ color: '#344054', fontWeight: '600' }}>
            {item.name}
          </Text>

          {universityId === item.id && (
            <Icon name="check" size={18} color="#713AF3" />
          )}
        </TouchableOpacity>
      ))}
    </View>
  </TouchableOpacity>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  typeTabs: { flexDirection: 'row', gap: 7, marginBottom: 12 },
  typeTab: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeTabSelected: { borderColor: '#8B73F8' },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5DFF7',
    borderRadius: 10,
    marginBottom: 12,
    padding: 3,
  },
  statusTab: {
    flex: 1,
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
  },
  statusTabSelected: { backgroundColor: '#713AF3' },
  statusTabText: { fontSize: 13, fontWeight: '600', color: '#475467' },
  statusTabTextSelected: { color: '#FFF' },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: 44,
  },
  sortText: { fontSize: 11, color: '#667085' },
  scopeNote: { fontSize: 10, color: '#667085', marginBottom: 10 },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
  },
  codeBlock: { flex: 1 },
  eyebrow: { fontSize: 10, color: '#98A2B3', marginBottom: 2 },
  leadCode: { fontSize: 16, fontWeight: '700', color: '#344054' },
  leadName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#182230',
    marginTop: 12,
    marginBottom: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  calledBadge: { backgroundColor: '#DDF8EA' },
  pendingBadge: { backgroundColor: '#FFF1C6' },
  badgeText: { fontSize: 11, fontWeight: '700' },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 15,
    // marginBottom: 6,
  },
  phoneLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 40,
  },
  updateStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 9,
    borderRadius: 7,
    backgroundColor: '#F8F9FC',
    marginBottom: 6,
  },
  updateStripCalled: { backgroundColor: '#EBFAF4' },
  updateText: { flex: 1, fontSize: 11, color: '#475467' },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F2F0F8',
    marginTop: 10,
    paddingTop: 10,
  },
  whatsappButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D9EDE4',
  },
  whatsappText: { fontSize: 12, fontWeight: '600', color: '#13865F' },
  responseButton: {
    width: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    backgroundColor: '#F0ECFF',
  },
  primaryCallButton: {
    flex: 1.6,
    minHeight: 44,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#713AF3',
  },
  container: { flex: 1, padding: 16, backgroundColor: '#F7F5FC' },
  subtitle: { fontSize: 13, color: '#667085', marginVertical: 10 },
  topHeader: {
    gap: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stagePicker: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD6ED',
    borderRadius: 10,
    marginBottom: 2,
    flex: 1,
    // overflow: 'hidden',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#6C4CF1',
    borderRadius: 9,
    paddingHorizontal: 13,
    paddingVertical: 15,
  },
  filterButtonActive: { backgroundColor: '#6C4CF1' },
  filterButtonText: { color: '#6C4CF1', fontSize: 13, fontWeight: '600' },
  filterButtonTextActive: { color: '#FFF' },
  filterBadge: {
    minWidth: 19,
    height: 19,
    paddingHorizontal: 5,
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: { color: '#6C4CF1', fontSize: 10, fontWeight: '700' },
  activeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F0ECFF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  activeFilterText: { color: '#5B3FD3', fontSize: 12, fontWeight: '500' },
  clearFilterLink: {
    marginLeft: 5,
    color: '#6C4CF1',
    fontSize: 12,
    fontWeight: '700',
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DDD6ED',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#6C4CF1',
    borderRadius: 10,
    padding: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: '600' },
  disabled: { opacity: 0.4 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  error: { color: '#B42318', textAlign: 'center' },
  empty: { textAlign: 'center', color: '#667085', padding: 32 },
  serialNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6C4CF1',
    marginBottom: 12,
  },
  card: {
    borderWidth: 1,
    borderColor: '#E8E3F2',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  detail: { flexDirection: 'row', paddingVertical: 4, gap: 12 },
  label: { flex: 1, color: '#667085', fontSize: 12 },
  value: { flex: 1.5, color: '#1F2937', fontSize: 13 },
  arrowButton: {
    width: 44,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#6C4CF1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callButton: {
    flex: 1.5,
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#ABEFC6',
  },
  callText: { flex: 1 },
  phoneNumber: { color: '#11643E', fontSize: 14, fontWeight: '700' },
  callHint: { color: '#18794E', fontSize: 11, marginTop: 3 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  filterModal: {
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
    alignSelf: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  filterContent: { padding: 18 },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  filterHeaderText: { flex: 1, paddingRight: 12 },
  filterTitle: { fontSize: 19, fontWeight: '700', color: '#1F2937' },
  filterSubtitle: { fontSize: 12, color: '#667085', marginTop: 3 },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#344054',
    marginBottom: 7,
  },
  filterPicker: {
    minHeight: 54,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    marginBottom: 18,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  filterPickerDisabled: { backgroundColor: '#F9FAFB', opacity: 0.6 },
  pickerLoading: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  pickerLoadingText: { fontSize: 13, color: '#667085' },
  filterFooter: { flexDirection: 'row', gap: 10, marginTop: 4 },
  clearButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: { color: '#344054', fontWeight: '600' },
  applyButton: {
    flex: 1.4,
    backgroundColor: '#6C4CF1',
    borderRadius: 10,
    paddingVertical: 13,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: { color: '#FFF', fontWeight: '600' },
  radioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    borderRadius: 9,
    backgroundColor: '#FFF',
  },
  radioOptionSelected: {
    borderColor: '#6C4CF1',
    backgroundColor: '#F0ECFF',
  },
  radioCircle: {
    width: 17,
    height: 17,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#98A2B3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleSelected: {
    borderColor: '#6C4CF1',
  },
  radioDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#6C4CF1',
  },
  radioText: {
    fontSize: 12,
    color: '#475467',
    fontWeight: '500',
  },
  radioTextSelected: {
    color: '#6C4CF1',
    fontWeight: '700',
  },
  mobileRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 6,
  },
  mobileButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 8,
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#ABEFC6',
    borderRadius: 9,
  },
  mobileNumber: {
    color: '#11643E',
    fontSize: 13,
    fontWeight: '700',
  },
  dateFilterRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 7,
  marginBottom: 10,
},

dateFilterBox: {
  flex: 1,
  minHeight: 46,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  paddingHorizontal: 10,
  backgroundColor: '#FFF',
  borderWidth: 1,
  borderColor: '#DDD6ED',
  borderRadius: 9,
},

dateFilterLabel: {
  fontSize: 9,
  color: '#98A2B3',
},

dateFilterValue: {
  fontSize: 12,
  fontWeight: '700',
  color: '#344054',
},

dateApplyButton: {
  width: 42,
  height: 46,
  borderRadius: 9,
  backgroundColor: '#6C4CF1',
  alignItems: 'center',
  justifyContent: 'center',
},
});
