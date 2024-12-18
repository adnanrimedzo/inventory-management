import { TransferDto } from '../../model/dto/TransferDto';
import { TransferStatus } from '../../model/dto/TransferStatus';

export interface ITransferService {
  processTransfer(transfer: TransferDto): any;
  updateTransferStatus(transferId: number, status: TransferStatus): any;
}

export const ITransferService = Symbol('ITransferService');
