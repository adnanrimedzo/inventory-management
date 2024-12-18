import { Test, TestingModule } from '@nestjs/testing';
import { TransferService } from '../../src/transfer/domain/service/TransferService';
import { ITransferRepository } from '../../src/transfer/domain/ports/in/ITransferRepository';
import { IFxRateService } from '../../src/fx-rate/domain/ports/out/IFxRateService';
import { ILiquidityService } from '../../src/liquidity/domain/ports/out/ILiquidityService';
import { ISettlementEventProducer } from '../../src/transfer/domain/ports/in/ISettlementEventProducer';
import { TransferStatus } from '../../src/transfer/domain/model/dto/TransferStatus';
import { TransferDto } from '../../src/transfer/domain/model/dto/TransferDto';
import { TransferError } from '../../src/transfer/domain/model/errors/TransferError';
import { FxRateDto } from '../../src/fx-rate/domain/model/dto/FxRateDto';

describe('TransferService', () => {
  let service: TransferService;
  let transferRepository: ITransferRepository;
  let fxRateService: IFxRateService;
  let liquidityService: ILiquidityService;
  let settlementEventProducer: ISettlementEventProducer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransferService,
        {
          provide: ITransferRepository,
          useValue: {
            updateTransferStatus: jest.fn(),
            saveTransfer: jest.fn(),
          },
        },
        {
          provide: IFxRateService,
          useValue: {
            getFxRate: jest.fn(),
          },
        },
        {
          provide: ILiquidityService,
          useValue: {
            updateLiquidity: jest.fn(),
          },
        },
        {
          provide: ISettlementEventProducer,
          useValue: {
            publishSettlementEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransferService>(TransferService);
    transferRepository = module.get<ITransferRepository>(ITransferRepository);
    fxRateService = module.get<IFxRateService>(IFxRateService);
    liquidityService = module.get<ILiquidityService>(ILiquidityService);
    settlementEventProducer = module.get<ISettlementEventProducer>(
      ISettlementEventProducer,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateTransferStatus', () => {
    it('should call updateTransferStatus on the repository', async () => {
      const transferId = 1;
      const status = TransferStatus.COMPLETED;
      await service.updateTransferStatus(transferId, status);
      expect(transferRepository.updateTransferStatus).toHaveBeenCalledWith(
        transferId,
        status,
      );
    });
  });

  describe('processTransfer', () => {
    it('should process a transfer', async () => {
      const transfer: TransferDto = {
        externalReferenceId: '123',
        senderId: 1,
        receiverId: 2,
        amount: 100,
        currencyX: 'USD',
        currencyY: 'EUR',
        status: TransferStatus.PENDING,
        createdAt: new Date(),
      };
      const fxRate: FxRateDto = {
        rate: 1,
        timestamp: new Date(),
        currencyX: 'USD',
        currencyY: 'EUR',
      };
      jest.spyOn(fxRateService, 'getFxRate').mockResolvedValue(fxRate);
      jest
        .spyOn(liquidityService, 'updateLiquidity')
        .mockResolvedValue(undefined);
      jest
        .spyOn(transferRepository, 'saveTransfer')
        .mockResolvedValue(transfer);
      jest
        .spyOn(settlementEventProducer, 'publishSettlementEvent')
        .mockResolvedValue(undefined);

      await service.processTransfer(transfer);

      expect(fxRateService.getFxRate).toHaveBeenCalledWith('USD', 'EUR');
      expect(liquidityService.updateLiquidity).toHaveBeenCalledWith('EUR', -99);
      expect(transferRepository.saveTransfer).toHaveBeenCalledWith(transfer);
      expect(settlementEventProducer.publishSettlementEvent).toHaveBeenCalled();
    });

    it('should throw an error if currencies are not supported', async () => {
      const transfer: TransferDto = {
        externalReferenceId: '123',
        senderId: 1,
        receiverId: 2,
        amount: 100,
        currencyX: 'INVALID',
        currencyY: 'EUR',
        status: TransferStatus.PENDING,
        createdAt: new Date(),
      };
      await expect(service.processTransfer(transfer)).rejects.toThrow(
        TransferError,
      );
    });
  });
});
