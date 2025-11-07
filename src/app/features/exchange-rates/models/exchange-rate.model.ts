export interface ExchangeRate {
  id: string;
  rate: number;
  currencySourceId: string;
  currencyTargetId: string;
  currencySource?: CurrencyInfo;
  currencyTarget?: CurrencyInfo;
  isActive: boolean;
  createdAt: Date;
  createdBy?: string;
  modifiedAt?: Date;
  modifiedBy?: string;
}

export interface CurrencyInfo {
  id: string;
  code: string;
  description: string;
}

export interface CreateExchangeRateRequest {
  rate: number;
  currencySourceId: string;
  currencyTargetId: string;
  createdBy?: string;
}

export interface UpdateExchangeRateRequest {
  rate?: number;
  currencySourceId?: string;
  currencyTargetId?: string;
  modifiedBy?: string;
}
