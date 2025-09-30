import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface AppConfig {
  production: boolean;
  apiUrl: string;
  apiVersion: string;
  features: {
    enableToast: boolean;
    enablePagination: boolean;
    defaultPageSize: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: AppConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): AppConfig {
    return {
      production: environment.production,
      apiUrl: environment.apiUrl,
      apiVersion: environment.apiVersion,
      features: environment.features
    };
  }

  get(): AppConfig {
    return this.config;
  }

  getApiUrl(): string {
    return this.config.apiUrl;
  }

  getFeatures() {
    return this.config.features;
  }

  isProduction(): boolean {
    return this.config.production;
  }
}
