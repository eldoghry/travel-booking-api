import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { BaseWorkerPool } from './base-worker-pool';
import { WorkerPoolConfig, WorkerPoolType } from './worker-pool.interface';

@Injectable()
export class WorkerPoolManager implements OnModuleDestroy {
  private pools: Map<WorkerPoolType, BaseWorkerPool> = new Map();
  private configs: Map<WorkerPoolType, WorkerPoolConfig> = new Map();

  onModuleDestroy() {
    for (const pool of this.pools.values()) pool.destroy();
    this.configs.clear();
    this.pools.clear();
  }

  registerConfig(cfg: WorkerPoolConfig) {
    this.configs.set(cfg.type, cfg);
  }

  getOrCreateWorkerPool(type: WorkerPoolType) {
    const existing = this.pools.get(type);
    if (existing) return existing;

    const cfg = this.configs.get(type);
    if (!cfg) throw new Error(`No config found for worker pool type: ${type}`);

    return this.createPool(type, cfg);
  }

  private createPool(type: WorkerPoolType, cfg: WorkerPoolConfig) {
    const newPool = new BaseWorkerPool(cfg);
    this.pools.set(type, newPool);
    return newPool;
  }
}
