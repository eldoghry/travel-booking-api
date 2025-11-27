export class SendNotificationDto {
  to: string;
  subject?: string;
  body?: string;
  template?: string;
  context?: Record<string, any>;
  amount?: number;
  paymentId?: string;
}
