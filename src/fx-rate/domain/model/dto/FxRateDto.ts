import { Currency } from 'money';

export class FxRateDto {
  constructor(
    public readonly currencyX: Currency,
    public readonly currencyY: Currency,
    public readonly rate: number,
    public readonly timestamp: Date,
    public id?: number,
  ) {}
}
