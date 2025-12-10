export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
  context?: Record<string, any>;
  template?: string;
}
