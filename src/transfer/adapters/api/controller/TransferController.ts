import { Body, Controller, Inject, Post } from '@nestjs/common';
import { TransferDto } from '../../../domain/model/dto/TransferDto';
import { TransferRequest } from '../request/TransferRequest';
import { ITransferService } from '../../../domain/ports/out/ITransferService';
import { TransferStatus } from '../../../domain/model/dto/TransferStatus';

@Controller('transfer')
export class TransferController {
  constructor(
    @Inject(ITransferService)
    private readonly transferService: ITransferService,
  ) {}

  @Post()
  handleTransfer(@Body() transferRequest: TransferRequest) {
    const transfer = new TransferDto(
      transferRequest.externalReferenceId,
      transferRequest.senderId,
      transferRequest.receiverId,
      transferRequest.amount,
      transferRequest.currencyX,
      transferRequest.currencyY,
      TransferStatus.PENDING,
    );
    return this.transferService.processTransfer(transfer);
  }
}
