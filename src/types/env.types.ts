export type AppEnvironment = 'development' | 'staging' | 'production' | 'test';

export interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  environment: AppEnvironment;
  appVersion: string;
  sentryDsn?: string;
  oneSignalAppId?: string;
}
