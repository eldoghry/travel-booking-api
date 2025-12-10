import { AsyncLocalStorage } from 'async_hooks';

interface RequestStore {
  userId: number | null;
  ip?: string;
  userAgent?: string;
  requestId?: string;
}

const als = new AsyncLocalStorage<RequestStore>();

export class RequestContext {
  static run(store: RequestStore, callback: () => any) {
    als.run(store, callback);
  }

  static getUserId(): number | null {
    return als.getStore()?.userId ?? null;
  }

  static getIp(): string | undefined {
    return als.getStore()?.ip;
  }

  static getUserAgent(): string | undefined {
    return als.getStore()?.userAgent;
  }

  static getRequestId(): string | undefined {
    return als.getStore()?.requestId;
  }
}
