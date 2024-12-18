import { TransferDto } from '../../model/dto/TransferDto';
import { TransferStatus } from '../../model/dto/TransferStatus';

export interface ITransferRepository {
  saveTransfer(transfer: TransferDto): Promise<TransferDto>;

  updateTransferStatus(
    transferId: number,
    status: TransferStatus,
  ): Promise<TransferDto>;
}

export const ITransferRepository = Symbol('ITransferRepository');
