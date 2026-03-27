export interface FinancialRow {
  id: string;
  company: string;
  securityName: string;
  traderName: string;
  cusip: string;
  isin: string;
  assetClass: string;
  region: string;
  book: string;
  tradingVolume: number;
  pnl: number;
  price: number;
  quantity: number;
}

export type AggregationFnName = 'sum' | 'mean' | 'min' | 'max' | 'count';

export interface DimensionDef {
  id: string;
  label: string;
}

export interface MeasureDef {
  id: string;
  label: string;
  defaultAgg: AggregationFnName;
  format: (value: number) => string;
}
