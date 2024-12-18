import { Currency } from 'money';
import { TransferStatus } from './TransferStatus';

export class TransferDto {
  constructor(
    public readonly externalReferenceId: string,
    public readonly senderId: number,
    public readonly receiverId: number,
    public readonly amount: number,
    public readonly currencyX: Currency,
    public readonly currencyY: Currency,
    public readonly status: TransferStatus,
    public readonly id?: number,
    public readonly createdAt?: Date,
  ) {}
}
