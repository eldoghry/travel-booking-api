import { isDebugMode } from 'src/common/utils/helper';
import { BaseTask, Task } from '../pools/worker-pool.interface';
import { EmailPayload } from 'src/common/email/email.interface';
import { sendEmail } from 'src/common/email/email.provider';

const { parentPort } = require('worker_threads');

parentPort.on('message', async (message: BaseTask<EmailPayload>) => {
  const { data, taskId } = message;

  isDebugMode() && console.log('🛠️ (Email Worker): Try Sending email from worker:', taskId);

  await new Promise((res) => setTimeout(res, 3000));

  await sendEmail(data);

  parentPort.postMessage({ status: 'sent', job: message });
});
