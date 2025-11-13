import { Injectable } from '@nestjs/common';

@Injectable()
export class SmsService {
  async send(to: string, message: string) {
    console.log('📲 Sending SMS...');
    console.log(`To: ${to}`);
    console.log('Message:', message);
    console.log(`-`.repeat(80));
  }
}
