import { Injectable } from '@nestjs/common';
import { WorkerPoolManager } from './worker-pool.manager';
import { WorkerPoolType } from './worker-pool.interface';

@Injectable()
export class WorkerPoolRouter {
  constructor(private manager: WorkerPoolManager) {}

  addTaskToWorkerPool<T = any, R = any>(type: WorkerPoolType, taskData: T): Promise<R> {
    const pool = this.manager.getOrCreateWorkerPool(type);
    return pool.addTask(taskData);
  }
}
