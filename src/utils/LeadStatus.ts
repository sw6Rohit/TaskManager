// Date-only and timezone-free API timestamps represent device-local time.
export const leadUpdateDate = (value: unknown): Date | null => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const text = value.trim();
  const local =
    /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?$/.exec(
      text,
    );
  const date = local
    ? new Date(
        +local[1],
        +local[2] - 1,
        +local[3],
        +(local[4] || 0),
        +(local[5] || 0),
        +(local[6] || 0),
      )
    : new Date(text);
  if (!Number.isFinite(date.getTime())) return null;
  if (
    local &&
    (date.getFullYear() !== +local[1] ||
      date.getMonth() !== +local[2] - 1 ||
      date.getDate() !== +local[3])
  )
    return null;
  return date;
};

export const wasLeadUpdatedToday = (value: unknown, now = new Date()) => {
  const date = leadUpdateDate(value);
  return (
    date != null &&
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};
