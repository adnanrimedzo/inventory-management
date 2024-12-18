import { Currency } from 'money';

export class SettlementDto {
  constructor(
    public readonly amount: number,
    public readonly currencyX: Currency,
    public readonly currencyY: Currency,
    public readonly rate: number,
    public readonly transferId: number,
    public readonly date: Date,
    public readonly margin: number,
    public id?: number,
  ) {}
}
