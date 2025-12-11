import { EmailPayload } from './email.interface';

export async function sendEmail(payload: EmailPayload) {
  console.log('email payload', payload);
  console.log(
    `📨 Email Provider: Sending Email To: (${payload.to}) | Subject: (${payload.subject}) | template: (${payload.template}).`,
  );
  console.log(`Body: ${payload.body || payload?.context?.body || 'N/A'}`);
  console.log(`-`.repeat(80));
}
