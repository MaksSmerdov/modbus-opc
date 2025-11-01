export interface PollingStatus {
  isPolling: boolean;
  hasManager: boolean;
  isPollingEnabled: boolean;
}

export interface PollingResponse {
  message: string;
  isPolling: boolean;
}

export interface PollingError {
  error: string;
  message: string;
}

