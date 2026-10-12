import moment from 'moment';

// Date-only and timezone-free API timestamps represent device-local time.
export const leadUpdateDate = (value: unknown): Date | null => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const date = moment(value.trim(), moment.ISO_8601, true);
  return date.isValid() ? date.toDate() : null;
};

export const wasLeadUpdatedToday = (
  value: unknown,
  now: string | Date = moment().format(),
) => {
  const date = leadUpdateDate(value);
  const today = typeof now === 'string'
    ? moment(now, [moment.ISO_8601, 'DD-MM-YYYY'], true)
    : moment(now);
  return (
    date != null &&
    today.isValid() &&
    moment(date).format('YYYY-MM-DD') === today.format('YYYY-MM-DD')
  );
};
