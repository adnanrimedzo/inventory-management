import { Test, TestingModule } from '@nestjs/testing';
import { ITransferService } from '../../src/transfer/domain/ports/out/ITransferService';
import { TransferController } from '../../src/transfer/adapters/api/controller/TransferController';
import { TransferRequest } from '../../src/transfer/adapters/api/request/TransferRequest';
import { TransferDto } from '../../src/transfer/domain/model/dto/TransferDto';
import { TransferStatus } from '../../src/transfer/domain/model/dto/TransferStatus';

describe('TransferController', () => {
  let transferController: TransferController;
  let transferService: ITransferService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransferController],
      providers: [
        {
          provide: ITransferService,
          useValue: {
            processTransfer: jest.fn(),
          },
        },
      ],
    }).compile();

    transferController = module.get<TransferController>(TransferController);
    transferService = module.get<ITransferService>(ITransferService);
  });

  it('should process transfer', async () => {
    const transferRequest: TransferRequest = {
      externalReferenceId: 'ext-ref-123',
      senderId: 1,
      receiverId: 2,
      amount: 100,
      currencyX: 'USD',
      currencyY: 'EUR',
    };

    const transferDto = new TransferDto(
      transferRequest.externalReferenceId,
      transferRequest.senderId,
      transferRequest.receiverId,
      transferRequest.amount,
      transferRequest.currencyX,
      transferRequest.currencyY,
      TransferStatus.PENDING,
    );

    jest
      .spyOn(transferService, 'processTransfer')
      .mockResolvedValue(transferDto);

    const result = await transferController.handleTransfer(transferRequest);

    expect(result).toEqual(transferDto);
    expect(transferService.processTransfer).toHaveBeenCalledWith(transferDto);
  });
});
