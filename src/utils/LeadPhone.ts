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
  const text = String(value ?? '')
    .normalize('NFKC')
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .trim();
  if (!/^\+?[\d\s().-]+$/.test(text)) return null;
  const number = text.replace(/[\s().-]/g, '');
  return /^\+?\d{1,15}$/.test(number) ? number : null;
};
