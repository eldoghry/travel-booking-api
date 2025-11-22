export enum BookingType {
    Flight = 'flight',
    Hotel = 'hotel',
}

export enum TransactionPaymentStatus {
    INITIATED = 'INITIATED',           // User started payment
    CREATED = 'CREATED',               // Order created at PayPal
    APPROVED = 'APPROVED',             // Customer approved payment (before capture)
    PENDING = 'PENDING',               // Waiting for external response
    CAPTURED = 'CAPTURED',             // Payment captured successfully
    COMPLETED = 'COMPLETED',           // Payment completed successfully & Webhook verified
    FAILED = 'FAILED',                 // Payment failed
    CANCELLED = 'CANCELLED',           // Cancelled by user or system
    REFUNDED = 'REFUNDED',             // Full refund
    PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED', // Partial refund
    EXPIRED = 'EXPIRED'                // PayPal session expired
}
