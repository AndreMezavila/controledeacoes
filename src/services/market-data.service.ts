import { QuoteData } from '@/types';

// Mock baseline quotes for Brazilian B3 and Global assets
const BASELINE_QUOTES: Record<string, { price: number; name: string }> = {
  PETR4: { price: 38.45, name: 'Petrobras PN' },
  VALE3: { price: 61.2, name: 'Vale ON' },
  ITUB4: { price: 34.8, name: 'Itaú Unibanco PN' },
  BBDC4: { price: 13.9, name: 'Banco Bradesco PN' },
  BBAS3: { price: 27.5, name: 'Banco do Brasil ON' },
  WEGE3: { price: 54.1, name: 'WEG ON' },
  RENT3: { price: 45.3, name: 'Localiza ON' },
  ABEV3: { price: 12.15, name: 'Ambev ON' },
  MGLU3: { price: 9.85, name: 'Magazine Luiza ON' },
  IVVB11: { price: 345.5, name: 'iShares S&P 500 Fundo de Índice' },
  BOVA11: { price: 126.8, name: 'iShares Ibovespa Fundo de Índice' },
  SMAL11: { price: 94.2, name: 'iShares Small Cap Fundo de Índice' },
  HGLG11: { price: 162.4, name: 'CSHG Logística FII' },
  MXRF11: { price: 10.15, name: 'Maxi Renda FII' },
  AAPL: { price: 228.5, name: 'Apple Inc.' },
  NVDA: { price: 141.2, name: 'Nvidia Corp.' },
  MSFT: { price: 425.8, name: 'Microsoft Corp.' },
  AMZN: { price: 202.4, name: 'Amazon.com Inc.' },
};

interface CacheEntry {
  quote: QuoteData;
  expiresAt: number;
}

const quoteCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

export class MarketDataService {
  /**
   * Fetches quote for a single ticker with fallback and caching
   */
  static async getQuote(ticker: string): Promise<QuoteData> {
    const symbol = ticker.toUpperCase().trim();
    const cached = quoteCache.get(symbol);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.quote;
    }

    const quotes = await this.getQuotes([symbol]);
    return quotes[symbol] || this.generateFallbackQuote(symbol);
  }

  /**
   * Fetches quotes in batch for multiple tickers
   */
  static async getQuotes(tickers: string[]): Promise<Record<string, QuoteData>> {
    const cleanTickers = Array.from(new Set(tickers.map((t) => t.toUpperCase().trim()))).filter(Boolean);
    const result: Record<string, QuoteData> = {};
    const tickersToFetch: string[] = [];

    // Check cache first
    for (const t of cleanTickers) {
      const cached = quoteCache.get(t);
      if (cached && cached.expiresAt > Date.now()) {
        result[t] = cached.quote;
      } else {
        tickersToFetch.push(t);
      }
    }

    if (tickersToFetch.length === 0) {
      return result;
    }

    const token = process.env.BRAPI_TOKEN;

    if (token) {
      try {
        const url = `https://brapi.dev/api/quote/${encodeURIComponent(tickersToFetch.join(','))}?token=${token}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(url, {
          signal: controller.signal,
          next: { revalidate: 60 },
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.results && Array.isArray(data.results)) {
            for (const item of data.results) {
              const symbol = item.symbol?.toUpperCase();
              if (symbol && typeof item.regularMarketPrice === 'number') {
                const quote: QuoteData = {
                  ticker: symbol,
                  price: Number(item.regularMarketPrice.toFixed(2)),
                  changePct: Number((item.regularMarketChangePercent || 0).toFixed(2)),
                  updatedAt: item.regularMarketTime || new Date().toISOString(),
                  isMock: false,
                };
                result[symbol] = quote;
                quoteCache.set(symbol, { quote, expiresAt: Date.now() + CACHE_TTL_MS });
              }
            }
          }
        }
      } catch (err) {
        console.warn('Brapi API unavailable or timed out, utilizing fallback quotes:', err);
      }
    }

    // Fill in any tickers that failed or did not have BRAPI_TOKEN with resilient fallback
    for (const t of tickersToFetch) {
      if (!result[t]) {
        const quote = this.generateFallbackQuote(t);
        result[t] = quote;
        quoteCache.set(t, { quote, expiresAt: Date.now() + CACHE_TTL_MS });
      }
    }

    return result;
  }

  /**
   * Generates a deterministic yet realistic fallback quote for any ticker
   */
  static generateFallbackQuote(ticker: string): QuoteData {
    const symbol = ticker.toUpperCase().trim();
    const baseline = BASELINE_QUOTES[symbol];

    let basePrice = baseline?.price;
    if (!basePrice) {
      // Generate a consistent pseudo-random price based on ticker characters if unknown
      let hash = 0;
      for (let i = 0; i < symbol.length; i++) {
        hash = (hash << 5) - hash + symbol.charCodeAt(i);
        hash |= 0;
      }
      basePrice = Math.abs(hash % 90) + 10.5;
    }

    // Subtle intraday simulated variation between -1.5% and +1.5%
    const now = new Date();
    const minuteVariation = Math.sin(now.getMinutes() + symbol.length) * 0.012;
    const finalPrice = Number((basePrice * (1 + minuteVariation)).toFixed(2));
    const changePct = Number((minuteVariation * 100).toFixed(2));

    return {
      ticker: symbol,
      price: finalPrice,
      changePct,
      updatedAt: now.toISOString(),
      isMock: true,
    };
  }

  /**
   * Returns common company/asset name if known
   */
  static getAssetName(ticker: string): string {
    const symbol = ticker.toUpperCase().trim();
    return BASELINE_QUOTES[symbol]?.name || symbol;
  }
}
