import {leadUpdateDate, wasLeadUpdatedToday} from '../src/utils/LeadStatus';
import moment from 'moment';

test('compares only the date of fractional-second API timestamps with Moment strings', () => {
  const today = moment('2026-10-01T00:00:00').format();
  expect(wasLeadUpdatedToday('2026-10-01T10:47:34.1', today)).toBe(true);
  expect(wasLeadUpdatedToday('2026-10-01T23:59:59.999', today)).toBe(true);
  expect(wasLeadUpdatedToday('2026-09-30T23:59:59.999', today)).toBe(false);
  expect(wasLeadUpdatedToday('2026-10-02T00:00:00.1', today)).toBe(false);
  expect(wasLeadUpdatedToday('2026-10-01T10:47:34.1', '01-10-2026')).toBe(true);
});

test('compares local calendar dates, including date-only and SQL timestamps', () => {
  const today = new Date(2026, 8, 30, 12);
  expect(wasLeadUpdatedToday('2026-09-30', today)).toBe(true);
  expect(wasLeadUpdatedToday('2026-09-30 00:00:00', today)).toBe(true);
  expect(wasLeadUpdatedToday('2026-09-30T23:59:59', today)).toBe(true);
  expect(wasLeadUpdatedToday('2026-09-29T23:59:59', today)).toBe(false);
  expect(wasLeadUpdatedToday('2026-10-01', today)).toBe(false);
  expect(wasLeadUpdatedToday('2025-09-30', today)).toBe(false);
  expect(wasLeadUpdatedToday(new Date(2026, 8, 30, 0).toISOString(), today)).toBe(true);
});

test.each([null, undefined, '', 'invalid', '2026-02-30'])('missing or invalid update %s is pending', value => {
  expect(leadUpdateDate(value)).toBeNull();
  expect(wasLeadUpdatedToday(value)).toBe(false);
});
