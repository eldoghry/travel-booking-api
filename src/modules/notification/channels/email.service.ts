import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  async send(
    template: string,
    data: { to: string; subject: string; context: Record<string, any> },
  ) {
    console.log('📨 Sending Email...');
    console.log(`To: ${data.to}`);
    console.log('template:', template);
    console.log(`Subject: ${data.subject}`);
    console.log(`-`.repeat(80));
  }
}
