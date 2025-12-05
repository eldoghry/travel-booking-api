import { PayPalWebhookEvent } from "src/modules/payment/interfaces/paypal.interface";
import { BookingType } from "src/modules/transaction/enums/transaction.enum";
import { TransactionPaymentStatus } from "src/modules/transaction/enums/transaction.enum";

/**
 *  Payment Transaction
 */

interface PaymentTransactionFields {
  customerId?: number;
  bookingType: BookingType;
  bookingId: number;
  paymentMethodId: number;
  orderId: string;
  amount: number;
  currency: string;
  transactionReference: string;
  paymentReference: string;
  status: TransactionPaymentStatus;
}

interface PaymentAuditMetaBase {
  provider: "PayPal" | "Stripe";
  ip: string;
  userAgent: string;
  requestId: string;
  operation?: "create" | "update" | "statusChange" | "refund";
  operationDate?: Date;
}

interface PaymentTransactionAuditMeta extends PaymentAuditMetaBase {
  table: "transaction";
  transactionId: number;
}


export type TransactionKeys = keyof PaymentTransactionFields;

export interface PaymentTransactionAuditData<T extends TransactionKeys> {
  before: Partial<Pick<PaymentTransactionFields, T>> | null; // null for create
  after: Pick<PaymentTransactionFields, T>;
  metadata: PaymentTransactionAuditMeta;
}

/**
 *  Payment Transaction Details
 */

interface PaymentTransactionDetailsFields { 
  action: string;
  requestPayload?: Record<string, any> | null;
  responsePayload?: Record<string, any> | null;
  success: boolean;
  errorStack?: Record<string, any> | null;
}

interface PaymentTransactionDetailAuditMeta extends PaymentAuditMetaBase {
  table: "transactionDetail";
  transactionDetailId: number;
}

export type TransactionDetailKeys = keyof PaymentTransactionDetailsFields;

export interface PaymentTransactionDetailsAuditData<U extends TransactionDetailKeys> {
  before: Partial<Pick<PaymentTransactionDetailsFields, U>> | null;
  after: Pick<PaymentTransactionDetailsFields, U>;
  metadata: PaymentTransactionDetailAuditMeta;
}  


/**
 * Payment webhook event
 */
interface PaymentWebhookEventAuditMeta extends PaymentAuditMetaBase {}

export interface PaymentWebhookEventAuditData {
  payload: PayPalWebhookEvent;
  metadata: PaymentWebhookEventAuditMeta;
}