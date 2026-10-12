jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
}));
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import moment from 'moment';
import {Linking} from 'react-native';
import {act, create} from 'react-test-renderer';
import LeadDashboardScreen, {getSourceFilterMode} from '../src/screens/LeadDashboardScreen';
jest.mock('@react-native-picker/picker', () => ({
  Picker: Object.assign(
    (props: any) => require('react').createElement('Picker', props),
    {Item: 'PickerItem'},
  ),
}));
jest.mock('axios', () => ({
  post: jest.fn().mockImplementation((url: string) =>
    Promise.resolve({
      data: {
        data: url.includes('M03Stage')
          ? [
              {id: 18, statusName: 'New'},
              {id: 5, statusName: 'Sch Test', leadCount: 85},
            ]
          : [
              {
                leadId: 1,
                MobileNo1: '+91 98765 43210',
                MobileNo2: '+91 87654 32109',
              },
            ],
      },
    }),
  ),
}));
jest.mock('../src/redux/slices/userSlice', () => ({clearUser: jest.fn()}));
jest.mock('@react-navigation/native', () => ({useNavigation: () => ({reset: jest.fn()})}));
jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
  useSelector: (select: any) => select({user: {userInfo: {userId: 884}}}),
}));
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
jest.mock('react-native-flash-message', () => ({showMessage: jest.fn()}));
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
test('rendered lead number opens the dialer on press', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  let tree: any;
  await act(async () => {
    tree = create(<LeadDashboardScreen />);
  });
  const rawTextInViews = tree.root
    .findAllByType(require('react-native').View)
    .flatMap((view: any) => view.children.filter(
      (child: any) => typeof child === 'string' || typeof child === 'number',
    ));
  expect(rawTextInViews).toEqual([]);
  const button = tree.root.findAll(
    (node: any) =>
      node.props.accessibilityLabel === 'Call +91 98765 43210' &&
      typeof node.props.onPress === 'function',
  )[0];
  expect(button).toBeDefined();
  expect(
    tree.root.findAll(
      (node: any) => node.props.accessibilityLabel === 'Call +91 87654 32109',
    ).length,
  ).toBeGreaterThan(0);
  await act(async () => {
    await button.props.onPress();
  });
  expect(open).toHaveBeenCalledWith('tel:+919876543210');
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(
    'PENDING_LEAD_CALL',
    JSON.stringify({leadId: 1, phoneNumber: '+919876543210'}),
  );
  const picker = tree.root.findByType('Picker');
  await act(async () => {
    picker.props.onValueChange(5);
  });
  expect(axios.post).toHaveBeenCalledWith(
    expect.stringContaining('M03Stage'),
    {type: 5, id: 2, loginUserId: 884},
    expect.any(Object),
  );
  expect(axios.post).toHaveBeenLastCalledWith(
    expect.stringContaining('L08LeadsByStage'),
    expect.objectContaining({stageId: 5, pageNumber: 1}),
    expect.any(Object),
  );
  const responseButton = tree.root.findAll(
    (node: any) =>
      node.props.accessibilityLabel === 'Response' &&
      typeof node.props.onPress === 'function',
  )[0];
  open.mockClear();
  await act(async () => responseButton.props.onPress());
  expect(open).not.toHaveBeenCalled();
  expect(axios.post).toHaveBeenLastCalledWith(
    expect.stringContaining('get-lead-response-page'),
    {leadId: 1},
    expect.any(Object),
  );
  act(() => tree.unmount());
  open.mockRestore();
});

test.each([[null, 'CAMPAIGN'], [8, 'CAMPAIGN'], [8, 'REFERENCE'], ['EXT000016', 'REFERENCE']] as const)(
  'searches API by selected name for selection %s in mode %s',
  async (campaignId, mode) => {
    (axios.post as jest.Mock).mockClear();
    (axios.post as jest.Mock).mockImplementation((url, body) =>
      Promise.resolve({
        data: {
          data: url.includes('M03Stage')
            ? [{id: 18, statusName: 'New'}]
            : url.includes('L07Source')
            ? [{Id: 2, Name: 'Website', CampaignAllowed: mode === 'CAMPAIGN', ReferenceAllowed: mode === 'REFERENCE'}]
            : {
                items: [
                  {leadId: body.pageNumber, SourceId: 999, CampaignId: 999},
                ],
                totalRecords: 20,
              },
        },
      }),
    );
    (axios as any).get = jest.fn().mockResolvedValue({
      data: {
        data: [
          typeof campaignId === 'string'
            ? {Id: campaignId, Name: 'Adarsh Gyan Sarover Public School'}
            : {sourceId: 2, referenceId: 8, referenceName: 'September Campaign'},
        ],
      },
    });
    let tree: any;
    await act(async () => {
      tree = create(<LeadDashboardScreen />);
    });
    const pressAncestor = async (node: any) => {
      let button = node.parent;
      while (!button.props.onPress) button = button.parent;
      await button.props.onPress();
    };
    await act(async () => {
      await pressAncestor(
        tree.root.findAll(
          (node: any) => node.type === 'Icon' && node.props.name === 'filter',
        )[0],
      );
    });
    await act(async () => {
      tree.root.findAllByType('Picker')[1].props.onValueChange(2);
    });
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('dashboard-filters'),
      expect.objectContaining({params: {mode, sourceId: 2}}),
    );
    const optionName = typeof campaignId === 'string' ? 'Adarsh Gyan Sarover Public School' : 'September Campaign';
    expect(tree.root.findAllByType('PickerItem').some(
      (item: any) => item.props.value === String(campaignId ?? 8) && item.props.label === optionName,
    )).toBe(true);
    await act(async () => {
      tree.root.findAllByType('Picker')[2].props.onValueChange(campaignId);
    });
    expect(tree.root.findAllByType('Picker')[2].props.selectedValue).toBe(
      campaignId == null ? null : String(campaignId),
    );
    await act(async () => {
      await pressAncestor(
        tree.root.findAll(
          (node: any) =>
            node.type === require('react-native').Text &&
            node.props.children === 'Apply Filters',
        )[0],
      );
    });
    const leadCalls = () =>
      (axios.post as jest.Mock).mock.calls.filter(([url]) =>
        url.includes('L08LeadsByStage'),
      );
    const expectedSearch = campaignId ? optionName : 'Website';
    expect(leadCalls()).toHaveLength(2);
    expect(leadCalls()[1][1]).toEqual(
      expect.objectContaining({
        search: expectedSearch,
        pageNumber: 1,
        pageSize: 99999,
      }),
    );
    expect(leadCalls()[1][1]).not.toHaveProperty('sourceId');
    expect(leadCalls()[1][1]).not.toHaveProperty('campaignId');
    // Server results must be displayed even when their IDs differ from the selections.
    const list = () => tree.root.findByType(require('react-native').FlatList);
    expect(list().props.data).toHaveLength(1);
    const next = tree.root.findAll(
      (node: any) =>
        node.props.accessibilityLabel === 'Next page' &&
        typeof node.props.onPress === 'function',
    )[0];
    expect(next.props.disabled).toBe(true);
    expect(leadCalls()[0][1].pageSize).toBe(99999);
    act(() => tree.unmount());
  },
);


test('Pending and Called tabs group by Created_at today without another API call', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  (axios.post as jest.Mock).mockClear();
  (axios.post as jest.Mock).mockImplementation((url: string) => Promise.resolve({data: {data:
    url.includes('M03Stage') ? [{id: 18, statusName: 'New'}] : [
      {leadId: 1, Created_at: new Date().toISOString(), updated_at: yesterday.toISOString()},
      {leadId: 2, created_at: yesterday.toISOString(), updated_at: new Date().toISOString()},
      {leadId: 3, Created_at: null},
      {leadId: 4, Created_at: 'invalid'},
    ]
  }}));
  let tree: any;
  await act(async () => {tree = create(<LeadDashboardScreen />);});
  const list = () => tree.root.findByType(require('react-native').FlatList);
  expect(list().props.data.map((row: any) => row.leadId)).toEqual([2, 3, 4]);
  const called = tree.root.findAll((node: any) => node.props.accessibilityLabel === 'Called leads' && typeof node.props.onPress === 'function')[0];
  const calls = (axios.post as jest.Mock).mock.calls.length;
  await act(async () => {called.props.onPress();});
  expect(list().props.data.map((row: any) => row.leadId)).toEqual([1]);
  expect((axios.post as jest.Mock).mock.calls).toHaveLength(calls);
  act(() => tree.unmount());
});

test('source flags determine the supported filter mode', () => {
  expect(getSourceFilterMode({Id: 2, Name: 'Google Ads', CampaignAllowed: true, ReferenceAllowed: false})).toBe('CAMPAIGN');
  expect(getSourceFilterMode({CampaignAllowed: false, ReferenceAllowed: true})).toBe('REFERENCE');
  expect(getSourceFilterMode({CampaignAllowed: false, ReferenceAllowed: false})).toBeNull();
});

test('the exact API timestamp appears in Called on October 1', async () => {
  const clock = jest.spyOn(moment, 'now').mockReturnValue(
    moment('2026-10-01T12:00:00').valueOf(),
  );
  (axios.post as jest.Mock).mockImplementation((url: string) =>
    Promise.resolve({data: {data: url.includes('M03Stage')
      ? [{id: 18, statusName: 'New'}]
      : [
          {leadId: 10, createdAt: null, Created_at: '2026-10-01T10:47:34.1'},
          {leadId: 11, Created_at: '2026-09-30T10:47:34.1'},
        ],
    }}),
  );
  let tree: any;
  try {
    await act(async () => {tree = create(<LeadDashboardScreen />);});
    const list = tree.root.findByType(require('react-native').FlatList);
    const called = tree.root.findAll((node: any) => node.props.accessibilityLabel === 'Called leads' && typeof node.props.onPress === 'function')[0];
    await act(async () => {called.props.onPress();});
    expect(tree.root.findByType(require('react-native').FlatList).props.data.map((row: any) => row.leadId)).toEqual([10]);
  } finally {
    if (tree) act(() => tree.unmount());
    clock.mockRestore();
  }
});

test.each([
  ['New', 'newLead'], ['Retry', 'retry'], ['Today', 'todayFollow'],
  ['Later', 'comingUp'], ['Overdue', 'overDue'],
])('refreshes stages and leads with the %s filter', async (label, leadFilter) => {
  (axios.post as jest.Mock).mockClear();
  (axios.post as jest.Mock).mockImplementation((url: string) => Promise.resolve({
    data: {data: url.includes('M03Stage') ? [{id: 18, statusName: 'New'}] : [{leadId: 1}]},
  }));
  let tree: any;
  await act(async () => {tree = create(<LeadDashboardScreen />);});
  (axios.post as jest.Mock).mockClear();
  const text = tree.root.findAll((node: any) =>
    node.type === require('react-native').Text && node.props.children === label,
  )[0];
  let tab = text.parent;
  while (tab && typeof tab.props.onPress !== 'function') tab = tab.parent;
  await act(async () => {await tab.props.onPress();});
  const calls = (axios.post as jest.Mock).mock.calls;
  expect(calls).toHaveLength(2);
  expect(calls[0][0]).toContain('M03Stage');
  expect(calls[0][1]).toEqual(expect.objectContaining({leadFilter}));
  expect(calls[1][0]).toContain('L08LeadsByStage');
  expect(calls[1][1]).toEqual(expect.objectContaining({leadFilter, pageNumber: 1}));
  act(() => tree.unmount());
});
