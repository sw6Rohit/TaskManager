import {showMessage} from 'react-native-flash-message';
jest.mock('react-native-flash-message', () => ({showMessage: jest.fn()}));
import React from 'react';
import axios from 'axios';
import {Alert} from 'react-native';
import {act, create} from 'react-test-renderer';
import CallFeedbackModal from '../src/components/CallFeedbackModal';
jest.mock('../src/utils/LeadCallContext', () => ({
  resolveLeadCall: jest.fn().mockResolvedValue(333),
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
jest.mock('axios', () => ({post: jest.fn()}));
const version = '2026-07-01T03:20:53.867';
const page = {
  data: {
    isSuccess: true,
    data: {
      lead: {Updated_at: version},
      allowedResponses: [{ResponseId: 52, ResponseName: 'Call Back Later'}],
    },
  },
};

test.each([true, false])('saving handles API success=%s', async success => {
  (axios.post as jest.Mock)
    .mockReset()
    .mockResolvedValueOnce(page)
    .mockResolvedValueOnce({
      data: {isSuccess: success, message: 'Save result'},
    });
  const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  (showMessage as jest.Mock).mockClear();
  const close = jest.fn();
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
        onClose={close}
      />,
    );
  });
  await act(async () => tree.root.findByType('Picker').props.onValueChange(52));
  const save = tree.root.findAll(
    (node: any) => node.props.onPress?.name === 'saveFeedback',
  )[0];
  await act(async () => save.props.onPress());
  expect(axios.post).toHaveBeenLastCalledWith(
    expect.stringContaining('update-lead-response'),
    expect.objectContaining({
      leadId: 333,
      responseId: 52,
      expectedUpdatedAt: version,
      actionBy: 884,
      manualFollowUpDateTime: expect.any(String),
      manualRemark: '',
      assignedUserId: null,
      mentorUserId: null,
      selectedCourseId: null,
      ipAddress: null,
    }),
    expect.any(Object),
  );
  expect(close).toHaveBeenCalledTimes(success ? 1 : 0);
  if (success) {
    expect(showMessage).toHaveBeenCalledWith({
      message: 'Save result',
      type: 'success',
      duration: 3000,
    });
    expect(alert).not.toHaveBeenCalled();
  } else {
    expect(alert).toHaveBeenCalled();
    expect(showMessage).not.toHaveBeenCalled();
  }
  act(() => tree.unmount());
  alert.mockRestore();
});
