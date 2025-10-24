import { HttpException, Injectable } from '@nestjs/common';
import { AbstractAxiosService } from '../axios/abstract-axios';
import { AxiosService } from '../axios/axios.service';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { AmadeusEndpoints } from './amadeus-request';

@Injectable()
export class AmadeusAxiosService extends AbstractAxiosService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(
    axiosService: AxiosService,
    private readonly configService: ConfigService,
  ) {
    const axiosInstance = axiosService.createInstance('amadeus', {
      baseURL: process.env.AMADEUS_API_BASE_URL,
      timeout: 10000,
    });

    super(axiosInstance);
  }

  private async _handleRequest(
    config: InternalAxiosRequestConfig,
  ): Promise<InternalAxiosRequestConfig> {
    const token = await this._getAccessToken();
    config.headers.Authorization = `Bearer ${token}`;
    config.headers['Content-Type'] = 'application/json';
    return config;
  }

  private _handleResponse(response: AxiosResponse<any>): any {
    // console.log('✅ [Amadeus] Response received:', {
    //   status: response.status,
    //   data: response.data,
    // });

    return response.data;
  }

  protected registerInterceptors(): void {
    this.axiosInstance.interceptors.request.use(this._handleRequest.bind(this));
    this.axiosInstance.interceptors.response.use(
      this._handleResponse.bind(this),
      this.handleError.bind(this),
    );
  }

  protected async handleError(error: AxiosError): Promise<never> {
    if (error.response?.status === 401) {
      await this._refreshToken();
      const token = await this._getAccessToken();

      if (error.config) {
        error.config.headers = { ...error.config.headers, Authorization: `Bearer ${token}` } as any;
        return this.axiosInstance.request(error.config);
      }
    }

    // other errors
    throw new HttpException(
      {
        provider: 'Amadeus',
        status: error.response?.status || 500,
        data: error.response?.data || null,
        message: (error.response?.data as any)?.errors?.[0]?.detail || error.message,
      },

      error.response?.status || 500,
    );
  }

  private async _getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken!;
    }

    // otherwise refresh it
    await this._refreshToken();
    return this.accessToken!;
  }

  private async _refreshToken(): Promise<void> {
    const clientId = this.configService.get('AMADEUS_API_KEY');
    const clientSecret = this.configService.get('AMADEUS_API_SECRET');
    const authUrl = `${this.configService.get('AMADEUS_API_BASE_URL')}${AmadeusEndpoints.AUTHENTICATE}`;

    try {
      const { data } = await axios.post(
        authUrl,
        {
          grant_type: 'client_credentials',
          client_id: clientId!,
          client_secret: clientSecret!,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000 - 60_000; // 1 min safety buffer
      console.log(
        `🔃 [Amadeus] Token refreshed, valid until ${new Date(this.tokenExpiry).toISOString()}`,
      );
    } catch (error) {
      console.error('💥 [Amadeus] Failed to refresh token', error.response?.data || error.message);
      throw new Error('Amadeus token refresh failed');
    }
  }
}
