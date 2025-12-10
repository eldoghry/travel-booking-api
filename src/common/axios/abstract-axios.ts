import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export abstract class AbstractAxiosService {
  readonly axiosInstance: AxiosInstance;

  constructor(axiosInstance: AxiosInstance) {
    this.axiosInstance = axiosInstance;
    this.registerInterceptors();
  }

  /**
   * Implement this to add custom interceptors (auth, logging, etc.)
   */
  protected abstract registerInterceptors(): void;

  /**
   * Implement this to handle request errors gracefully.
   */
  protected abstract handleError(error: any): Promise<never>;

  /**
   * Wrapper for making requests.
   */
  protected async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    try {
      return await this.axiosInstance.request<T>(config);
    } catch (error) {
      return await this.handleError(error);
    }
  }
}
