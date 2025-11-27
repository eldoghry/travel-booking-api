import { Worker } from 'worker_threads';

export enum WorkerPoolType {
  'SMS' = 'SMS',
  'EMAIL' = 'EMAIL',
}

export interface WorkerPoolConfig {
  type: WorkerPoolType; // e.g., 'sms', 'email','image-processing', 'data-fetching', etc.
  workerScriptPath: string; // absolute or relative (will be resolved)
  minWorkers?: number;
  maxWorkers?: number;
  scaleUpThreshold?: number; // queue length to trigger spawn
  idleTimeoutMs?: number; // when to kill idle worker
}

export interface BaseTask<T = any> {
  data: T;
  taskId: string;
  createdAt: number;
}

export interface Task<T = any, R = any> extends BaseTask<T> {
  resolve: (result: R) => void;
  reject: (error: any) => void;
  // priority?: number; // lower number = higher priority
  // timeoutMs?: number;
}

export class ScalableWorker extends Worker {
  __task: Task | null = null;
}
