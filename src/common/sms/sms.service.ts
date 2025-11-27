import { Injectable } from '@nestjs/common';
import { SmsPayload } from './sms.interface';
import { sendSms } from './sms.provider';

@Injectable()
export class SmsService {
  async send(payload: SmsPayload) {
    return sendSms(payload);
  }
}
