# Worker Pool Module

A high-performance, scalable worker pool system built on Node.js Worker Threads for handling CPU-intensive and I/O-bound tasks asynchronously. The module supports dynamic scaling, automatic cleanup, and task queuing with intelligent load balancing.

## Table of Contents

- [Worker Pool Module](#worker-pool-module)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Architecture](#architecture)
  - [Installation \& Setup](#installation--setup)
    - [1. Module Registration](#1-module-registration)
    - [2. Automatic Initialization](#2-automatic-initialization)
      - [API Reference](#api-reference)
    - [Configuration](#configuration)

## Overview

The Worker Pool module provides an efficient way to offload long-running tasks (email sending, SMS delivery, data processing, etc.) to isolated worker threads, preventing them from blocking the main event loop. It features:

- **Dynamic Scaling**: Automatically spawns and terminates workers based on queue depth
- **Task Queuing**: Manages pending tasks with automatic assignment to available workers
- **Type Safety**: Full TypeScript support with enum-based worker pool types
- **Graceful Shutdown**: Ensures all resources are properly cleaned up on module destruction

## Features

✅ **Worker Thread Pool Management** - Efficient thread lifecycle management  
✅ **Auto-Scaling** - Dynamically adjusts worker count based on queue depth  
✅ **Idle Timeout** - Automatically terminates idle workers to free resources  
✅ **Task Queuing** - Queues tasks when no workers are available  
✅ **Error Handling** - Automatic worker replacement on errors/crashes  
✅ **Built-in Monitoring** - Status tracking and debug logging  
✅ **Type-Safe** - Full TypeScript support with interfaces and enums  
✅ **NestJS Integration** - Seamless integration with NestJS dependency injection

## Architecture

```
┌─────────────────────────────────────────────┐
│         WorkerPoolModule (NestJS)           │
│  - Initialization & Lifecycle Management     │
└────────────────┬──────────────────────────────┘
                 │
        ┌────────▼─────────┐
        │ WorkerPoolManager│
        │ - Pool Registry  │
        │ - Configuration  │
        └────────┬─────────┘
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼──────────────┐   ┌─────▼──────────────┐
│ BaseWorkerPool   │   │ BaseWorkerPool     │
│ (EMAIL)          │   │ (SMS)              │
│ - 1-3 workers    │   │ - 1-3 workers      │
│ - Task Queue     │   │ - Task Queue       │
│ - Auto-scaling   │   │ - Auto-scaling     │
└───┬──────────────┘   └─────┬──────────────┘
    │                         │
    │                         │
┌───▼────────┐      ┌────────▼────┐
│ email.worker.ts  │   │ sms.worker.ts     │
│ - Isolated thread│   │ - Isolated thread  │
│ - Sends emails   │   │ - Sends SMS        │
└────────────┘      └────────────┘

WorkerPoolRouter manages all pools and routes tasks based on type
```

## Installation & Setup

### 1. Module Registration

Import the `WorkerPoolModule` in your feature module:

```typescript
// filepath: src/modules/booking/booking.module.ts
import { Module } from '@nestjs/common';
import { WorkerPoolModule } from '../worker-pool/worker-pool.module';
import { BookingService } from './booking.service';

@Module({
  imports: [WorkerPoolModule],
  providers: [BookingService],
})
export class BookingModule {}
```

### 2. Automatic Initialization

The module automatically initializes worker pools on application startup through the onModuleInit() lifecycle hook:

- Registers EMAIL and SMS worker pool configurations
- Creates initial worker instances
- Starts auto-scaling monitors

#### API Reference

**WorkerPoolRouter**: Main service for submitting tasks to worker pools.

```typescript
addTaskToWorkerPool<T = any, R = any>(
  type: WorkerPoolType,
  taskData: T
): Promise<R>
```

Parameters:

type - Worker pool type (SMS | EMAIL)
taskData - Task payload to process
Returns: Promise resolving to the worker's response

Example:

```typescript
const result = await this.workerPoolRouter.addTaskToWorkerPool(WorkerPoolType.EMAIL, {
  to: 'user@example.com',
  subject: 'Welcome',
  body: '...',
});
```

**BaseWorkerPool**: Core pool implementation (internal use, managed by WorkerPoolManager).

Key Methods:

- addTask<T, R>(data: T): Promise<R> - Queue a task
- getStatus() - Retrieve pool statistics
- destroy() - Cleanup resources

WorkerPoolManager
Manages all worker pool instances and configurations.

Methods:

```typescript
registerConfig(cfg: WorkerPoolConfig): void
getOrCreateWorkerPool(type: WorkerPoolType): BaseWorkerPool
```

### Configuration

Worker pools are configured in wokrer-pool.setup.ts. Modify these settings to tune performance:

Email Pool Configuration

```typescript
{
  type: WorkerPoolType.EMAIL,
  workerScriptPath: emailWorkerScriptPath,
  minWorkers: 1,        // Minimum idle workers
  maxWorkers: 3,        // Maximum workers
  scaleUpThreshold: 3,  // Queue size to trigger scaling
  idleTimeoutMs: 10_000 // Idle timeout before termination
}
```

SMS Pool Configuration

```typescript
{
  type: WorkerPoolType.SMS,
  workerScriptPath: smsWorkerScriptPath,
  minWorkers: 1,
  maxWorkers: 3,
  scaleUpThreshold: 5,  // Higher threshold for SMS
  idleTimeoutMs: 15_000
}
```
