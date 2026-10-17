import React from 'react';
import axios from 'axios';
import {act, create} from 'react-test-renderer';
import {Text} from 'react-native';
import LeadHistoryModal from '../src/components/LeadHistoryModal';
jest.mock('axios', () => ({post: jest.fn()}));
jest.mock('react-native-vector-icons/Feather', () => 'Icon');
const lead = {leadId: 13206, name: 'Chanchal', code: 'LED013206'};
const entry = {
  StageTransactionId: 15272,
  ResponseName: 'Call Connected',
  FromStageName: 'New',
  ToStageName: 'Contacted',
  FinalRemark: 'Spoke with parent',
  ActionAt: '2026-10-14T15:05:11.1567516',
  TimelineStatus: 'CURRENT',
  AttemptCount: 1,
  ActionBy: 2584,
};
const texts = (tree: any) =>
  tree.root
    .findAllByType(Text)
    .map((node: any) => node.props.children)
    .flat()
    .join(' ');

test('loads the selected lead with authentication and pages through history', async () => {
  (axios.post as jest.Mock).mockResolvedValue({
    data: {isSuccess: true, totalRecords: 21, data: [entry]},
  });
  let tree: any;
  await act(async () => {
    tree = create(
      <LeadHistoryModal lead={lead} token="test-token" onClose={jest.fn()} />,
    );
  });
  expect(axios.post).toHaveBeenLastCalledWith(
    expect.stringContaining('get-lead-timeline'),
    {leadId: 13206, pageNo: 1, pageSize: 20},
    expect.objectContaining({headers: {Authorization: 'Bearer test-token'}}),
  );
  expect(texts(tree)).toContain('Spoke with parent');
  expect(texts(tree)).toContain('CURRENT');
  const next = tree.root.findAll(
    (node: any) =>
      node.props.accessibilityLabel === 'Next history page' &&
      typeof node.props.onPress === 'function',
  )[0];
  await act(async () => {
    next.props.onPress();
  });
  expect(axios.post).toHaveBeenLastCalledWith(
    expect.any(String),
    {leadId: 13206, pageNo: 2, pageSize: 20},
    expect.any(Object),
  );
  act(() => tree.unmount());
});

test('shows server failures and retries into empty history', async () => {
  (axios.post as jest.Mock)
    .mockResolvedValueOnce({
      data: {isSuccess: false, message: 'History unavailable'},
    })
    .mockResolvedValueOnce({
      data: {isSuccess: true, totalRecords: 0, data: []},
    });
  let tree: any;
  await act(async () => {
    tree = create(<LeadHistoryModal lead={lead} onClose={jest.fn()} />);
  });
  expect(texts(tree)).toContain('History unavailable');
  const retry = tree.root.findAll(
    (node: any) =>
      typeof node.props.onPress === 'function' &&
      node
        .findAllByType(Text)
        .some((text: any) => text.props.children === 'Retry'),
  )[0];
  await act(async () => {
    retry.props.onPress();
  });
  expect(texts(tree)).toContain('No history found');
  act(() => tree.unmount());
});
