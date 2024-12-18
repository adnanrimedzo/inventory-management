import { Test, TestingModule } from '@nestjs/testing';
import { SettlementService } from '../../src/settlement/domain/service/SettlementService';
import { ISettlementRepository } from '../../src/settlement/domain/ports/in/ISettlementRepository';
import { ILiquidityService } from '../../src/liquidity/domain/ports/out/ILiquidityService';
import { IRevenueEventProducer } from '../../src/settlement/domain/ports/in/IRevenueEventProducer';
import { ITransferCompletedEventProducer } from '../../src/settlement/domain/ports/in/ITransferCompletedEventProducer';
import { SettlementDto } from '../../src/settlement/domain/model/dto/SettlementDto';
import { SettlementStatus } from '../../src/settlement/domain/model/enum/SettlementStatus';
import { RevenueDto } from '../../src/revenue/domain/model/dto/RevenueDto';

describe('SettlementService', () => {
  let settlementService: SettlementService;
  let settlementRepository: ISettlementRepository;
  let liquidityService: ILiquidityService;
  let revenueEventProducer: IRevenueEventProducer;
  let transferCompletedEventProducer: ITransferCompletedEventProducer;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettlementService,
        {
          provide: ISettlementRepository,
          useValue: {
            saveSettlement: jest.fn(),
            findSettlementByStatusAndCurrency: jest.fn(),
            updateSettlementStatus: jest.fn(),
          },
        },
        {
          provide: ILiquidityService,
          useValue: {
            updateLiquidity: jest.fn(),
          },
        },
        {
          provide: IRevenueEventProducer,
          useValue: {
            publishRevenueEvent: jest.fn(),
          },
        },
        {
          provide: ITransferCompletedEventProducer,
          useValue: {
            publishTransferCompletedEvent: jest.fn(),
          },
        },
      ],
    }).compile();

    settlementService = module.get<SettlementService>(SettlementService);
    settlementRepository = module.get<ISettlementRepository>(
      ISettlementRepository,
    );
    liquidityService = module.get<ILiquidityService>(ILiquidityService);
    revenueEventProducer = module.get<IRevenueEventProducer>(
      IRevenueEventProducer,
    );
    transferCompletedEventProducer =
      module.get<ITransferCompletedEventProducer>(
        ITransferCompletedEventProducer,
      );
  });

  it('should handle settlement', async () => {
    const settlementDto: SettlementDto = {
      amount: 100,
      currencyX: 'USD',
      currencyY: 'EUR',
      rate: 0.8,
      transferId: 10,
      date: new Date(),
      margin: 0.1,
    };

    await settlementService.handleSettlement(settlementDto);

    expect(settlementRepository.saveSettlement).toHaveBeenCalledWith(
      settlementDto,
    );
  });

  it('should process settlement', async () => {
    const settlementDtos: SettlementDto[] = [
      {
        amount: 100,
        currencyX: 'USD',
        currencyY: 'EUR',
        rate: 0.8,
        transferId: 10,
        date: new Date(),
        margin: 0.1,
      },
    ];

    jest
      .spyOn(settlementRepository, 'findSettlementByStatusAndCurrency')
      .mockResolvedValue(settlementDtos);
    jest
      .spyOn(settlementRepository, 'updateSettlementStatus')
      .mockResolvedValue(undefined);
    jest
      .spyOn(liquidityService, 'updateLiquidity')
      .mockResolvedValue(undefined);
    jest
      .spyOn(revenueEventProducer, 'publishRevenueEvent')
      .mockResolvedValue(undefined);
    jest
      .spyOn(transferCompletedEventProducer, 'publishTransferCompletedEvent')
      .mockResolvedValue(undefined);

    const result = await settlementService.processSettlement('USD', 10);

    expect(result).toBe(1);
    expect(
      settlementRepository.findSettlementByStatusAndCurrency,
    ).toHaveBeenCalledWith(SettlementStatus.PENDING, 'USD', 10);
    expect(liquidityService.updateLiquidity).toHaveBeenCalledWith('USD', 90);
    expect(revenueEventProducer.publishRevenueEvent).toHaveBeenCalledWith(
      expect.any(RevenueDto),
    );
    expect(
      transferCompletedEventProducer.publishTransferCompletedEvent,
    ).toHaveBeenCalledWith(10);
  });
});
