import { isDebugMode } from 'src/common/utils/helper';
import { BaseTask } from '../pools/worker-pool.interface';
import { SmsPayload } from 'src/common/sms/sms.interface';
import { sendSms } from 'src/common/sms/sms.provider';

const { parentPort } = require('worker_threads');

parentPort.on('message', async (message: BaseTask<SmsPayload>) => {
  const { data, taskId } = message;

  isDebugMode() && console.log('🛠️ (SMS Worker): Try Sending SMS from worker:', taskId);

  await new Promise((res) => setTimeout(res, 5000));

  await sendSms(data);

  parentPort.postMessage({ status: 'sent', job: message });
});
