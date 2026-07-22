/**
 * Formats an ISO 8601 timestamp as "YYYY-MM-DD HH:mm" in local time.
 * Locale-independent so it renders the same on every device; returns the
 * raw value when it cannot be parsed.
 */
export const formatDate = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  const pad = (value: number) => String(value).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};
