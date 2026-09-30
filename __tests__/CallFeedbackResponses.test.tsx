jest.mock('react-native-flash-message', () => ({showMessage: jest.fn()}));
import {Modal} from 'react-native';
import React from 'react';
import axios from 'axios';
import {act, create} from 'react-test-renderer';
import CallFeedbackModal from '../src/components/CallFeedbackModal';
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn(),
}));
jest.mock('../src/utils/LeadCallContext', () => ({
  resolveLeadCall: jest.fn().mockResolvedValue(11420),
}));
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('@react-native-picker/picker', () => ({
  Picker: Object.assign(
    (props: any) => require('react').createElement('Picker', props),
    {Item: 'PickerItem'},
  ),
}));
jest.mock('react-redux', () => ({
  useSelector: (select: any) => select({user: {userInfo: {userId: 884}}}),
}));
jest.mock('axios', () => ({
  post: jest
    .fn()
    .mockResolvedValue({
      data: {
        isSuccess: true,
        data: {
          allowedResponses: [
            {ResponseId: 52, ResponseName: 'Call Back Later', MapId: 102},
          ],
        },
      },
    }),
}));
test('loads responses for the linked lead and shows the response option', async () => {
  let tree: any;
  await act(async () => {
    tree = create(
      <CallFeedbackModal
        call={{
          phoneNumber: '9990671539',
          timestamp: Date.now(),
          duration: 10,
          callType: 'OUTGOING',
        }}
        onClose={jest.fn()}
      />,
    );
  });
  expect(axios.post).toHaveBeenCalledWith(
    expect.stringContaining('get-lead-response-page'),
    {leadId: 11420},
    expect.any(Object),
  );
  expect(
    tree.root.findAll(
      (node: any) =>
        node.props.label === 'Call Back Later' && node.props.value === 52,
    ).length,
  ).toBeGreaterThan(0);
  act(() => tree.unmount());
});

test('Android back does not dismiss feedback; cross button does', async () => {
  const onClose = jest.fn();
  let tree: any;
  await act(async () => {
    tree = create(
      <CallFeedbackModal
        call={{
          phoneNumber: '9990671539',
          timestamp: Date.now(),
          duration: 10,
          callType: 'OUTGOING',
        }}
        onClose={onClose}
      />,
    );
  });
  act(() => tree.root.findByType(Modal).props.onRequestClose());
  expect(onClose).not.toHaveBeenCalled();
  const cross = tree.root.findAll(
    (node: any) =>
      node.props.accessibilityLabel === 'Close feedback' &&
      typeof node.props.onPress === 'function',
  )[0];
  act(() => cross.props.onPress());
  expect(onClose).toHaveBeenCalledTimes(1);
  act(() => tree.unmount());
});
