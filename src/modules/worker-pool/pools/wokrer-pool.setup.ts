import { join } from 'path';
import { WorkerPoolType } from './worker-pool.interface';
import { WorkerPoolManager } from './worker-pool.manager';

export function initializePools(manager: WorkerPoolManager) {
  const smsWorkerScriptPath = join(__dirname, '..', 'workers', 'sms.worker');
  const emailWorkerScriptPath = join(__dirname, '..', 'workers', 'email.worker');

  manager.registerConfig({
    type: WorkerPoolType.EMAIL,
    workerScriptPath: emailWorkerScriptPath,
    minWorkers: 1,
    maxWorkers: 3,
    scaleUpThreshold: 3,
    idleTimeoutMs: 10_000,
  });

  manager.registerConfig({
    type: WorkerPoolType.SMS,
    workerScriptPath: smsWorkerScriptPath,
    minWorkers: 1,
    maxWorkers: 3,
    scaleUpThreshold: 5,
    idleTimeoutMs: 15_000,
  });

  manager.getOrCreateWorkerPool(WorkerPoolType.EMAIL);
  manager.getOrCreateWorkerPool(WorkerPoolType.SMS);
}
