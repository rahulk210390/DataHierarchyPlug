import type { FinancialRow } from '../types';

const companies = [
  'Goldman Sachs', 'Morgan Stanley', 'JP Morgan', 'BlackRock',
  'Citadel', 'Two Sigma', 'Renaissance Tech', 'Bridgewater', 'AQR Capital', 'Millennium',
];

const securities = [
  { name: 'Apple Inc',       cusip: '037833100', isin: 'US0378331005', assetClass: 'Equity' },
  { name: 'Microsoft Corp',  cusip: '594918104', isin: 'US5949181045', assetClass: 'Equity' },
  { name: 'Amazon.com Inc',  cusip: '023135106', isin: 'US0231351067', assetClass: 'Equity' },
  { name: 'Alphabet Inc',    cusip: '02079K305', isin: 'US02079K3059', assetClass: 'Equity' },
  { name: 'NVIDIA Corp',     cusip: '67066G104', isin: 'US67066G1040', assetClass: 'Equity' },
  { name: 'Tesla Inc',       cusip: '88160R101', isin: 'US88160R1014', assetClass: 'Equity' },
  { name: 'Meta Platforms',  cusip: '30303M102', isin: 'US30303M1027', assetClass: 'Equity' },
  { name: 'US Treasury 10Y', cusip: '912828ZL3', isin: 'US912828ZL30', assetClass: 'Fixed Income' },
  { name: 'US Treasury 2Y',  cusip: '91282CAX3', isin: 'US91282CAX39', assetClass: 'Fixed Income' },
  { name: 'EUR/USD Spot',    cusip: 'N/A',       isin: 'N/A',          assetClass: 'FX' },
  { name: 'GBP/USD Spot',    cusip: 'N/A',       isin: 'N/A',          assetClass: 'FX' },
  { name: 'Gold Futures',    cusip: 'N/A',       isin: 'N/A',          assetClass: 'Commodity' },
  { name: 'Crude Oil WTI',   cusip: 'N/A',       isin: 'N/A',          assetClass: 'Commodity' },
  { name: 'S&P 500 Put 4500',cusip: 'N/A',       isin: 'N/A',          assetClass: 'Derivative' },
  { name: 'VIX Call 20',     cusip: 'N/A',       isin: 'N/A',          assetClass: 'Derivative' },
];

const traders = [
  'Alice Chen', 'Bob Martinez', 'Carol Johnson', 'David Kim',
  'Emma Wilson', 'Frank Lee', 'Grace Park', 'Henry Brown',
  'Iris Zhang', 'James Patel', 'Karen Murphy', 'Leo Santos',
];

const regions: Record<string, string> = {
  'Equity': 'North America',
  'Fixed Income': 'North America',
  'FX': 'Europe',
  'Commodity': 'EMEA',
  'Derivative': 'Asia Pacific',
};

const regionVariants: Record<string, string[]> = {
  'Equity':       ['North America', 'Europe', 'Asia Pacific'],
  'Fixed Income': ['North America', 'Europe'],
  'FX':           ['Europe', 'Asia Pacific', 'North America'],
  'Commodity':    ['EMEA', 'North America', 'Asia Pacific'],
  'Derivative':   ['Asia Pacific', 'Europe', 'North America'],
};

const bookMap: Record<string, string[]> = {
  'Equity':       ['EQ-US-01', 'EQ-EU-01', 'EQ-AP-01'],
  'Fixed Income': ['FI-US-01', 'FI-EU-01'],
  'FX':           ['FX-GLOBAL-01', 'FX-GLOBAL-02'],
  'Commodity':    ['CMD-ENERGY-01', 'CMD-METALS-01'],
  'Derivative':   ['DRV-EQ-01', 'DRV-RATES-01'],
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(seededRandom(seed) * arr.length)];
}

function generateRow(index: number): FinancialRow {
  const s = index * 17 + 3;
  const security = pick(securities, s);
  const company = pick(companies, s + 1);
  const trader = pick(traders, s + 2);
  const regionList = regionVariants[security.assetClass] ?? [regions[security.assetClass] ?? 'North America'];
  const region = pick(regionList, s + 3);
  const bookList = bookMap[security.assetClass] ?? ['DEFAULT-01'];
  const book = pick(bookList, s + 4);

  const quantity = Math.round(seededRandom(s + 5) * 50000) + 500;
  const price = Math.round((seededRandom(s + 6) * 990 + 10) * 100) / 100;
  const tradingVolume = Math.round(quantity * price);
  const pnl = Math.round((seededRandom(s + 7) - 0.42) * tradingVolume * 0.08);

  return {
    id: `row-${index}`,
    company,
    securityName: security.name,
    traderName: trader,
    cusip: security.cusip,
    isin: security.isin,
    assetClass: security.assetClass,
    region,
    book,
    tradingVolume,
    pnl,
    price,
    quantity,
  };
}

export const mockFinancialData: FinancialRow[] = Array.from({ length: 50000 }, (_, i) => generateRow(i));
