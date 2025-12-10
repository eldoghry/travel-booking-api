export function formatDateToYMD(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-CA').format(parsedDate);
}

export function isDebugMode(): boolean {
  return process.env.DEBUG_MODE === 'true';
}
