import { randomUUID } from 'crypto';
import {
  BaseTask,
  ScalableWorker,
  Task,
  WorkerPoolConfig,
  WorkerPoolType,
} from './worker-pool.interface';
import { isDebugMode } from 'src/common/utils/helper';

export class BaseWorkerPool {
  private workers: ScalableWorker[] = [];
  private idleWorkers: ScalableWorker[] = [];
  private taskQueue: Task[] = [];
  private busyWorkers: Set<ScalableWorker> = new Set();
  private workerLastUsed = new Map<ScalableWorker, number>();
  private SCALE_INTERVAL = 2000;

  // ---
  private readonly type: WorkerPoolType;
  private readonly minWorkers: number;
  private readonly maxWorkers: number;
  private readonly workerScriptPath: string;
  private readonly scaleUpThreshold: number;
  private readonly idleTimeoutMs: number;
  private scaleTimer: NodeJS.Timeout;

  constructor(cfg: WorkerPoolConfig) {
    this.type = cfg.type;
    this.workerScriptPath = cfg.workerScriptPath;
    this.minWorkers = cfg?.minWorkers || 1;
    this.maxWorkers = cfg?.maxWorkers || 2;
    this.scaleUpThreshold = cfg?.scaleUpThreshold || 5;
    this.idleTimeoutMs = cfg?.idleTimeoutMs || 15_000;

    // Initialize the worker pool
    this.init();
  }

  private init() {
    for (let i = 0; i < this.minWorkers; i++) this.spawnWorker();
    this.scaleTimer = setInterval(() => {
      this.autoScaleAndCleanup();
      this.getStatus();
    }, this.SCALE_INTERVAL);
  }

  public destroy() {
    clearInterval(this.scaleTimer);
    for (const worker of this.workers) {
      try {
        worker.terminate();
      } catch (error) {
        throw new Error(`Failed to terminate worker: ${error}`);
      }
    }

    this.workers = [];
    this.idleWorkers = [];
    this.busyWorkers.clear();
    this.taskQueue = [];
    this.workerLastUsed.clear();
  }

  private spawnWorker(): ScalableWorker {
    const worker = new ScalableWorker(this.workerScriptPath);

    // listener
    worker.on('message', (msg: any) => this.onWorkerMessage(worker, msg));
    worker.on('error', (err: Error) => this.onWorkerError(worker, err));
    worker.on('exit', (code: number | null, signal: string | null) =>
      this.onWorkerExit(worker, code, signal),
    );

    // add worker to tracking lists
    this.workers.push(worker);
    this.idleWorkers.push(worker);
    this.workerLastUsed.set(worker, Date.now());

    return worker;
  }

  private removeWorker(worker: ScalableWorker) {
    try {
      worker.terminate();
    } catch (error) {}

    this.workers = this.workers.filter((w) => w !== worker);
    this.idleWorkers = this.idleWorkers.filter((w) => w !== worker);
    this.busyWorkers.delete(worker);
    this.workerLastUsed.delete(worker);
  }

  private replaceWorker(oldWorker: ScalableWorker) {
    this.removeWorker(oldWorker);
    if (this.workers.length < this.minWorkers) this.spawnWorker();
  }

  private autoScaleAndCleanup() {
    // scale up to maxWorkers in case of high queue size
    if (this.taskQueue.length > this.scaleUpThreshold && this.workers.length < this.maxWorkers) {
      this.scaleUp();
    }

    // scale down idle workers beyond minWorkers after idleTimeout
    if (this.workers.length > this.minWorkers) {
      this.scaleDown();
    }
  }

  private scaleUp() {
    const queueSize = this.taskQueue.length;
    const averageTasks = Math.max(1, Math.floor(queueSize / this.scaleUpThreshold));
    const spawnCount = Math.min(this.maxWorkers - this.workers.length, averageTasks);
    for (let i = 0; i < spawnCount; i++) this.spawnWorker();
  }

  private scaleDown() {
    const now = Date.now();
    for (const worker of this.idleWorkers) {
      const lastUsed = this.workerLastUsed.get(worker) || 0;
      if (now - lastUsed > this.idleTimeoutMs && this.workers.length > this.minWorkers) {
        this.removeWorker(worker);
      }
    }
  }

  private assignTasks() {
    while (this.taskQueue.length > 0 && this.idleWorkers.length > 0) {
      const worker = this.idleWorkers.shift()!;
      const task = this.taskQueue.shift()!;

      worker.__task = task;
      this.busyWorkers.add(worker);
      this.workerLastUsed.set(worker, Date.now());

      try {
        const baseTask: BaseTask = {
          data: task.data,
          taskId: task.taskId,
          createdAt: task.createdAt,
        };
        worker.postMessage(baseTask);
      } catch (error) {
        task.reject(error);
        this.replaceWorker(worker);
      }
    }
  }

  public addTask<T, R>(data: T): Promise<R> {
    return new Promise((resolve, reject) => {
      const task: Task = {
        taskId: randomUUID(),
        data,
        resolve,
        reject,
        createdAt: Date.now(),
      };

      this.taskQueue.push(task);
      this.assignTasks();
    });
  }

  public getStatus() {
    if (isDebugMode()) {
      console.log(
        `🗒️  [${this.type} Worker] __ [Total|Idle|Busy]:[${this.workers.length}|${this.idleWorkers.length}|${this.busyWorkers.size}] __ [MIN|MAX]:[${this.minWorkers}|${this.maxWorkers}] __ Queued: ${this.taskQueue.length}`,
      );
      console.log('-'.repeat(80));
    }

    return {
      type: this.type,
      totalWorkers: this.workers.length,
      idleWorkers: this.idleWorkers.length,
      busyWorkers: this.busyWorkers.size,
      queuedTasks: this.taskQueue.length,
      minWorkers: this.minWorkers,
      maxWorkers: this.maxWorkers,
      idleTimeoutMs: this.idleTimeoutMs,
      scaleUpThreshold: this.scaleUpThreshold,
      workerScriptPath: this.workerScriptPath,
    };
  }

  // listeners for worker 'message', 'error', 'exit' events
  private onWorkerMessage(worker: ScalableWorker, message: any) {
    try {
      if (!worker.__task) return;
      worker.__task.resolve(message);

      // cleanup
      worker.__task = null;
      this.busyWorkers.delete(worker);
      this.idleWorkers.push(worker);
      this.workerLastUsed.set(worker, Date.now());

      // assign next task
      this.assignTasks();
    } catch (error) {}
  }

  private onWorkerError(worker: ScalableWorker, error: Error) {
    if (worker.__task) worker.__task.reject(error);
    this.replaceWorker(worker);
  }

  private onWorkerExit(worker: ScalableWorker, code: number | null, signal: string | null) {
    if (worker.__task)
      worker.__task.reject(new Error(`Worker exited with code ${code} and signal ${signal}`));
    this.replaceWorker(worker);
  }
}
