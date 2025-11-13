import { Module } from '@nestjs/common';
import { CoreModule } from '../core/core.module';
import { EmailConsumer } from './consumers/email.consumer';

@Module({
  imports: [CoreModule],
  providers: [EmailConsumer],
})
export class WorkerModule {}
