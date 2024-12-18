import { Money } from 'ts-money';
import { Currency } from 'money';

export class TransferFxService {
  static getDestinationCurrencyAmount(
    amount: number,
    currency: Currency,
    fxRate: number,
    margin: number,
  ): number {
    const money = new Money(amount, currency);
    const marginMoney = money.multiply(margin, Math.ceil);
    return money.subtract(marginMoney).multiply(fxRate, Math.ceil).amount;
  }
}
