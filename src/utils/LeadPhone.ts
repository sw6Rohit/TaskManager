// Recognize contact fields, not arbitrary numeric IDs in the lead record.
export const leadDialNumber = (
  field: string,
  value: unknown,
): string | null => {
  if (
    !/(phone|mobile|contact.*(no|number)|telephone|whatsapp)/i.test(field) ||
    /(id|verified|status|count|code|type)$/i.test(field)
  )
    return null;
  const text = String(value ?? '').trim();
  if (!/^\+?[\d\s().-]+$/.test(text)) return null;
  const number = text.replace(/[\s().-]/g, '');
  return /^\+?\d{7,15}$/.test(number) ? number : null;
};
