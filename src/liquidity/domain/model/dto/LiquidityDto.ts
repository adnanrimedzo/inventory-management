import { Currency } from 'money';

export class LiquidityDto {
  constructor(
    public readonly currency: Currency,
    public readonly amount: number,
    public readonly date: Date,
    public id?: number,
  ) {}
}
