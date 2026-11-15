const MONTHS: Record<string, string[]> = {
  'en-US': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  'es-419': ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
}

/**
 * Formats a Contentful date ("YYYY-MM-DD" or ISO string) as "Mar 2021" (en-US) or "Abr 2021" (es-419).
 * Parses the string directly to avoid timezone shifts.
 */
export function formatMonthYear(value: string | null | undefined, locale: string = 'en-US'): string {
  if (!value) return ''
  const match = /^(\d{4})-(\d{2})/.exec(value)
  if (!match) return value
  const [, year, month] = match
  const names = MONTHS[locale] ?? MONTHS['en-US']
  const index = Number(month) - 1
  return index >= 0 && index < 12 ? `${names[index]} ${year}` : value
}
