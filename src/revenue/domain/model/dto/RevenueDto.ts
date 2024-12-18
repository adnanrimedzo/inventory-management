import { Currency } from 'money';

export class RevenueDto {
  constructor(
    public readonly currency: Currency,
    public readonly amount: number,
    public readonly date: Date,
    public id?: number,
  ) {}
}
