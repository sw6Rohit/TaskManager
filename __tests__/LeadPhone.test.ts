import {leadDialNumber} from '../src/utils/LeadPhone';
test('normalizes phone numbers while retaining country code', () => {
  expect(leadDialNumber('MobileNumber', '+91 98765-43210')).toBe('+919876543210');
  expect(leadDialNumber('alternate_phone', '(011) 2345 6789')).toBe('01123456789');
});
test('does not turn IDs, invalid values, or dial commands into call links', () => {
  expect(leadDialNumber('leadId', '9876543210')).toBeNull();
  expect(leadDialNumber('phoneId', '9876543210')).toBeNull();
  expect(leadDialNumber('mobile', 'Unknown')).toBeNull();
  expect(leadDialNumber('phone', '*123#')).toBeNull();
});

test('supports copied formatting, numeric values, and short local numbers', () => {
  expect(leadDialNumber('MobileNo1', '+91\u200B 98765\u201143210')).toBe('+919876543210');
  expect(leadDialNumber('MobileNo1', '９８７６５４３２１０')).toBe('9876543210');
  expect(leadDialNumber('MobileNo1', 9876543210)).toBe('9876543210');
  expect(leadDialNumber('MobileNo1', '123456')).toBe('123456');
});
