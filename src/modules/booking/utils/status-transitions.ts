import { BookingStatus } from '../enums/booking-status.enum';

// Define allowed transitions map: current -> allowed next statuses
const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  [BookingStatus.PENDING]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED, BookingStatus.FAILED],
  [BookingStatus.CONFIRMED]: [
    BookingStatus.CANCELLED,
    BookingStatus.REFUNDED,
    BookingStatus.PARTIALLY_REFUNDED,
  ],
  [BookingStatus.CANCELLED]: [],
  [BookingStatus.FAILED]: [BookingStatus.CANCELLED],
  [BookingStatus.REFUNDED]: [],
  [BookingStatus.PARTIALLY_REFUNDED]: [BookingStatus.REFUNDED],
};

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  if (from === to) return true; // idempotent
  const allowed = ALLOWED_TRANSITIONS[from] || [];
  return allowed.includes(to);
}

export function assertCanTransition(from: BookingStatus, to: BookingStatus) {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid booking status transition: ${from} -> ${to}`);
  }
}

export { ALLOWED_TRANSITIONS };
