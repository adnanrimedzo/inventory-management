import { Currency } from 'money';

export interface ILiquidityConfig {
  getCurrencyConfig(): Currency[];
  getEnvironment(): string;
  getInitLiquidity(currency: Currency): number;
}

export const ILiquidityConfig = Symbol('ILiquidityConfig');
