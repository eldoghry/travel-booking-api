import { SmsPayload } from './sms.interface';

export async function sendSms(payload: SmsPayload) {
  console.log(`📲 (SMS Provider): Sending SMS To: ${payload.to} | Body: "${payload.message}"`);
  console.log(`-`.repeat(80));
}
