import { Module, OnModuleInit } from '@nestjs/common';
import { WorkerPoolRouter } from './pools/worker-pool.router';
import { WorkerPoolManager } from './pools/worker-pool.manager';
import { initializePools } from './pools/wokrer-pool.setup';

@Module({
  providers: [WorkerPoolRouter, WorkerPoolManager],
  exports: [WorkerPoolRouter],
})
export class WorkerPoolModule implements OnModuleInit {
  constructor(private readonly workerPoolManager: WorkerPoolManager) {}

  onModuleInit() {
    initializePools(this.workerPoolManager);
  }
}
