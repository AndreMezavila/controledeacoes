import { Transaction, CustodyPosition, PortfolioSummary } from '@/types';
import { MarketDataService } from './market-data.service';

export interface TickerHistoryResult {
  ticker: string;
  quantity: number;
  averagePrice: number;
  totalInvested: number;
  realizedProfitLoss: number;
}

export class PortfolioService {
  /**
   * Calculates the chronological position and Preço Médio (PM) for a specific ticker
   */
  static calculateTickerPosition(ticker: string, transactions: Transaction[]): TickerHistoryResult {
    const symbol = ticker.toUpperCase().trim();
    // Sort chronologically ascending
    const sorted = [...transactions]
      .filter((tx) => tx.ticker.toUpperCase() === symbol)
      .sort((a, b) => {
        const dateCompare = a.tradeDate.localeCompare(b.tradeDate);
        if (dateCompare !== 0) return dateCompare;
        return a.createdAt.toString().localeCompare(b.createdAt.toString());
      });

    let currentQty = 0;
    let averagePrice = 0;
    let realizedProfitLoss = 0;

    for (const tx of sorted) {
      if (tx.type === 'COMPRA') {
        const costPurchase = tx.quantity * tx.unitPrice + tx.fees;
        const totalInvestedBefore = currentQty * averagePrice;
        currentQty += tx.quantity;
        averagePrice = currentQty > 0 ? (totalInvestedBefore + costPurchase) / currentQty : 0;
      } else if (tx.type === 'VENDA') {
        const sellRevenue = tx.quantity * tx.unitPrice - tx.fees;
        const costBasis = tx.quantity * averagePrice;
        const pnl = sellRevenue - costBasis;
        realizedProfitLoss += pnl;

        currentQty -= tx.quantity;
        if (currentQty <= 0.000001) {
          currentQty = 0;
          averagePrice = 0;
        }
      }
    }

    // Clean floating point artifacts
    currentQty = Math.round(currentQty * 10000) / 10000;
    averagePrice = Math.round(averagePrice * 100) / 100;
    realizedProfitLoss = Math.round(realizedProfitLoss * 100) / 100;

    return {
      ticker: symbol,
      quantity: currentQty,
      averagePrice,
      totalInvested: Math.round(currentQty * averagePrice * 100) / 100,
      realizedProfitLoss,
    };
  }

  /**
   * Calculates all custody positions and overall portfolio summary for a set of transactions
   */
  static async getPortfolioData(
    transactions: Transaction[],
    quotesOverride?: Record<string, number>
  ): Promise<{
    positions: CustodyPosition[];
    summary: PortfolioSummary;
  }> {
    // Group all transactions by ticker
    const tickers = Array.from(new Set(transactions.map((tx) => tx.ticker.toUpperCase().trim())));
    const tickerMetrics = tickers.map((t) => this.calculateTickerPosition(t, transactions));

    // Get quotes for all tickers that have custody or transactions
    const quotes = await MarketDataService.getQuotes(tickers);

    let totalGrossValue = 0;
    let totalInvested = 0;
    let totalRealizedProfitLoss = 0;

    const positions: CustodyPosition[] = [];

    for (const metric of tickerMetrics) {
      totalRealizedProfitLoss += metric.realizedProfitLoss;

      // Only add to active custody positions if current quantity > 0
      if (metric.quantity > 0) {
        const quotePrice = quotesOverride?.[metric.ticker] ?? quotes[metric.ticker]?.price ?? metric.averagePrice;
        const grossValue = Math.round(metric.quantity * quotePrice * 100) / 100;
        const unrealizedProfitLoss = Math.round((grossValue - metric.totalInvested) * 100) / 100;
        const unrealizedProfitLossPct =
          metric.totalInvested > 0
            ? Math.round(((grossValue - metric.totalInvested) / metric.totalInvested) * 10000) / 100
            : 0;

        positions.push({
          ticker: metric.ticker,
          quantity: metric.quantity,
          averagePrice: metric.averagePrice,
          totalInvested: metric.totalInvested,
          currentQuote: quotePrice,
          grossValue,
          unrealizedProfitLoss,
          unrealizedProfitLossPct,
        });

        totalGrossValue += grossValue;
        totalInvested += metric.totalInvested;
      }
    }

    // Sort positions by gross value descending
    positions.sort((a, b) => b.grossValue - a.grossValue);

    const totalUnrealizedProfitLoss = Math.round((totalGrossValue - totalInvested) * 100) / 100;
    const totalUnrealizedProfitLossPct =
      totalInvested > 0 ? Math.round((totalUnrealizedProfitLoss / totalInvested) * 10000) / 100 : 0;

    const summary: PortfolioSummary = {
      totalGrossValue: Math.round(totalGrossValue * 100) / 100,
      totalInvested: Math.round(totalInvested * 100) / 100,
      totalUnrealizedProfitLoss,
      totalUnrealizedProfitLossPct,
      totalRealizedProfitLoss: Math.round(totalRealizedProfitLoss * 100) / 100,
      positionsCount: positions.length,
      buyAlertsCount: 0,
      sellAlertsCount: 0,
    };

    return { positions, summary };
  }
}
