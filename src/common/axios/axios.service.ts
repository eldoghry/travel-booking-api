import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

@Injectable()
export class AxiosService {
  private readonly logger = new Logger(AxiosService.name);
  private readonly instances = new Map<string, AxiosInstance>();

  createInstance(name: string, config: AxiosRequestConfig): AxiosInstance {
    if (this.instances.has(name)) return this.getInstance(name)!;

    // create new instance
    const instance = axios.create(config);
    this.instances.set(name, instance);

    this.logger.log(`Created new Axios instance for ${name}`);
    return instance;
  }

  getInstance(name: string): AxiosInstance | undefined {
    return this.instances.get(name);
  }
}
