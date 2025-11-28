import { EmailPayload } from './email.interface';
import { sendEmail } from './email.provider';

export class EmailService {
  async send(payload: EmailPayload) {
    return sendEmail(payload);
  }
}
