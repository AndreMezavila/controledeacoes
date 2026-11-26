export type OperationType = 'COMPRA' | 'VENDA';

export type AlertStatus = 'COMPRAR' | 'VENDER' | 'STOP_LOSS' | 'MANTER' | 'AGUARDAR';

export interface User {
  id: string;
  name: string | null;
  email: string;
  password?: string | null;
  emailVerified?: string | null;
  verificationToken?: string | null;
  verificationCode?: string | null;
  image?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface WatchlistAsset {
  id: string;
  userId: string;
  ticker: string;
  assetName?: string | null;
  targetBuyPrice: number; // Preço-Teto de Compra
  targetSellPrice: number; // Preço-Alvo de Venda
  stopLossPrice?: number | null; // Opcional: Stop Loss de proteção
  notes?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Transaction {
  id: string;
  userId: string;
  ticker: string;
  type: OperationType;
  quantity: number;
  unitPrice: number;
  fees: number;
  tradeDate: string; // YYYY-MM-DD
  notes?: string | null;
  createdAt: Date | string;
}

export interface CustodyPosition {
  ticker: string;
  quantity: number;
  averagePrice: number; // Preço Médio (PM)
  totalInvested: number; // Qty * PM
  currentQuote: number;
  grossValue: number; // Qty * Current Quote
  unrealizedProfitLoss: number; // grossValue - totalInvested
  unrealizedProfitLossPct: number; // ((currentQuote - PM) / PM) * 100
}

export interface ClosedTradeMetric {
  ticker: string;
  realizedProfitLoss: number;
}

export interface PortfolioSummary {
  totalGrossValue: number;
  totalInvested: number;
  totalUnrealizedProfitLoss: number;
  totalUnrealizedProfitLossPct: number;
  totalRealizedProfitLoss: number;
  positionsCount: number;
  buyAlertsCount: number;
  sellAlertsCount: number;
}

export interface AlertItem {
  id: string;
  ticker: string;
  assetName?: string | null;
  currentQuote: number;
  targetBuyPrice: number;
  targetSellPrice: number;
  stopLossPrice?: number | null;
  status: AlertStatus;
  targetBuyDistancePct: number;
  targetSellDistancePct: number;
  custodyQty: number;
  custodyAveragePrice: number;
  message: string;
  notes?: string | null;
}

export interface QuoteData {
  ticker: string;
  price: number;
  changePct: number;
  updatedAt: string;
  isMock?: boolean;
}
