import { EmailPayload } from './email.interface';

export async function sendEmail(payload: EmailPayload) {
  console.log(
    `📨 Email Provider: Sending Email To: (${payload.to}) | Subject: (${payload.subject}) | template: (${payload.template}).`,
  );
  console.log(`-`.repeat(80));
}
