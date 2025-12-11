import { BookingType } from 'src/modules/transaction/enums/transaction.enum';

export function formatDateToYMD(date: string | Date): string {
  const parsedDate = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-CA').format(parsedDate);
}

export function isDebugMode(): boolean {
  return process.env.DEBUG_MODE === 'true';
}

export function generateReferenceNumber(bookingType: BookingType): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${bookingType.toUpperCase()}-${timestamp}-${random}`;
}
