jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
}));
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import {Linking} from 'react-native';
import {act, create} from 'react-test-renderer';
import LeadDashboardScreen from '../src/screens/LeadDashboardScreen';
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
jest.mock('react-redux', () => ({
  useSelector: (select: any) => select({user: {userInfo: {userId: 884}}}),
}));
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
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
  act(() => tree.unmount());
  open.mockRestore();
});

test.each([null, 8])(
  'searches API by selected name for campaign %s',
  async campaignId => {
    (axios.post as jest.Mock).mockClear();
    (axios.post as jest.Mock).mockImplementation((url, body) =>
      Promise.resolve({
        data: {
          data: url.includes('M03Stage')
            ? [{id: 18, statusName: 'New'}]
            : url.includes('L07Source')
            ? [{sourceId: 2, sourceName: 'Website'}]
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
          {sourceId: 2, campaignId: 8, campaignName: 'September Campaign'},
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
    await act(async () => {
      tree.root.findAllByType('Picker')[2].props.onValueChange(campaignId);
    });
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
    const expectedSearch = campaignId ? 'September Campaign' : 'Website';
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


test('Pending and Called tabs group by updated_at today without another API call', async () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  (axios.post as jest.Mock).mockClear();
  (axios.post as jest.Mock).mockImplementation((url: string) => Promise.resolve({data: {data:
    url.includes('M03Stage') ? [{id: 18, statusName: 'New'}] : [
      {leadId: 1, updated_at: new Date().toISOString()},
      {leadId: 2, Updated_at: yesterday.toISOString()},
      {leadId: 3, updated_at: null},
      {leadId: 4, updated_at: 'invalid'},
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
