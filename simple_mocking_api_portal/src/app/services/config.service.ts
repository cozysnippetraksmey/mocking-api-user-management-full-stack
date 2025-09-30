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
    // In a real application, you might load this from a JSON file or API
    // For Docker deployments, you can override with environment variables
    return {
      production: environment.production,
      apiUrl: this.getApiUrlFromEnvironment(),
      apiVersion: environment.apiVersion,
      features: {
        enableToast: this.getBooleanEnv('ENABLE_TOAST', environment.features.enableToast),
        enablePagination: this.getBooleanEnv('ENABLE_PAGINATION', environment.features.enablePagination),
        defaultPageSize: this.getNumberEnv('DEFAULT_PAGE_SIZE', environment.features.defaultPageSize)
      }
    };
  }

  private getApiUrlFromEnvironment(): string {
    // Check for runtime environment variable (useful for Docker)
    if (typeof window !== 'undefined' && (window as any).env?.API_URL) {
      return (window as any).env.API_URL;
    }
    return environment.apiUrl;
  }

  private getBooleanEnv(key: string, defaultValue: boolean): boolean {
    if (typeof window !== 'undefined' && (window as any).env?.[key]) {
      return (window as any).env[key].toLowerCase() === 'true';
    }
    return defaultValue;
  }

  private getNumberEnv(key: string, defaultValue: number): number {
    if (typeof window !== 'undefined' && (window as any).env?.[key]) {
      const value = parseInt((window as any).env[key], 10);
      return isNaN(value) ? defaultValue : value;
    }
    return defaultValue;
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
