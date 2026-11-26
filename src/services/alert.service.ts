import { WatchlistAsset, Transaction, AlertItem, AlertStatus } from '@/types';
import { MarketDataService } from './market-data.service';
import { PortfolioService } from './portfolio.service';

export class AlertService {
  /**
   * Generates real-time decision alerts for all monitored assets of a user
   */
  static async evaluateAlerts(
    watchlist: WatchlistAsset[],
    transactions: Transaction[]
  ): Promise<AlertItem[]> {
    if (watchlist.length === 0) {
      return [];
    }

    const tickers = watchlist.map((item) => item.ticker.toUpperCase().trim());
    const quotes = await MarketDataService.getQuotes(tickers);

    const alerts: AlertItem[] = [];

    for (const item of watchlist) {
      const symbol = item.ticker.toUpperCase().trim();
      const quote = quotes[symbol] || MarketDataService.generateFallbackQuote(symbol);
      const currentPrice = quote.price;

      // Check current user custody for this asset
      const custodyMetric = PortfolioService.calculateTickerPosition(symbol, transactions);
      const custodyQty = custodyMetric.quantity;
      const custodyPM = custodyMetric.averagePrice;

      // Distance calculations
      // Target Buy: negative distance means price is below target buy (bargain / discount)
      const targetBuyDistancePct =
        item.targetBuyPrice > 0
          ? Math.round(((currentPrice - item.targetBuyPrice) / item.targetBuyPrice) * 10000) / 100
          : 0;

      // Target Sell: positive distance means price is above target sell (target reached or exceeded)
      const targetSellDistancePct =
        item.targetSellPrice > 0
          ? Math.round(((currentPrice - item.targetSellPrice) / item.targetSellPrice) * 10000) / 100
          : 0;

      let status: AlertStatus = 'AGUARDAR';
      let message = '';

      // Rule 1: Stop Loss Trigger
      if (item.stopLossPrice && currentPrice <= item.stopLossPrice && custodyQty > 0) {
        status = 'STOP_LOSS';
        message = `Alerta de Stop Loss ativado! Cotação (R$ ${currentPrice.toFixed(2)}) atingiu ou furou o stop (R$ ${item.stopLossPrice.toFixed(2)}).`;
      }
      // Rule 2: Target Sell Reached
      else if (currentPrice >= item.targetSellPrice) {
        status = 'VENDER';
        const gainMsg =
          custodyPM > 0
            ? ` Rendimento de ${(((currentPrice - custodyPM) / custodyPM) * 100).toFixed(1)}% sobre seu Preço Médio.`
            : '';
        message = `Preço-alvo de venda atingido! Cotação atual (R$ ${currentPrice.toFixed(2)}) superou a meta de R$ ${item.targetSellPrice.toFixed(2)}.${gainMsg}`;
      }
      // Rule 3: Target Buy Reached (Current <= Preço-Teto)
      else if (currentPrice <= item.targetBuyPrice) {
        status = 'COMPRAR';
        const discount = Math.abs(targetBuyDistancePct).toFixed(1);
        message = `Cotação atual (R$ ${currentPrice.toFixed(2)}) está ${discount}% abaixo do seu Preço-Teto de compra (R$ ${item.targetBuyPrice.toFixed(2)}). Ponto de entrada favorável.`;
      }
      // Rule 4: Holding custody within acceptable bounds
      else if (custodyQty > 0) {
        status = 'MANTER';
        message = `Posição em custódia (${custodyQty} ações @ PM R$ ${custodyPM.toFixed(2)}). Cotação na faixa neutra entre compra e venda.`;
      }
      // Rule 5: Awaiting buy entry
      else {
        status = 'AGUARDAR';
        message = `Aguardando correção para entrada. Cotação está ${targetBuyDistancePct.toFixed(1)}% acima do Preço-Teto (R$ ${item.targetBuyPrice.toFixed(2)}).`;
      }

      alerts.push({
        id: item.id,
        ticker: symbol,
        assetName: item.assetName || MarketDataService.getAssetName(symbol),
        currentQuote: currentPrice,
        targetBuyPrice: item.targetBuyPrice,
        targetSellPrice: item.targetSellPrice,
        stopLossPrice: item.stopLossPrice,
        status,
        targetBuyDistancePct,
        targetSellDistancePct,
        custodyQty,
        custodyAveragePrice: custodyPM,
        message,
        notes: item.notes,
      });
    }

    // Sort priority: STOP_LOSS first, then COMPRAR, then VENDER, then MANTER, then AGUARDAR
    const priorityOrder: Record<AlertStatus, number> = {
      STOP_LOSS: 0,
      COMPRAR: 1,
      VENDER: 2,
      MANTER: 3,
      AGUARDAR: 4,
    };

    alerts.sort((a, b) => priorityOrder[a.status] - priorityOrder[b.status]);

    return alerts;
  }
}
