import { Test, TestingModule } from '@nestjs/testing';
import { RevenueService } from '../../src/revenue/domain/service/RevenueService';
import { RevenueDto } from '../../src/revenue/domain/model/dto/RevenueDto';
import { Currency } from 'money';
import { IRevenueRepository } from '../../src/revenue/domain/ports/in/IRevenueRepository';

describe('RevenueService', () => {
  let service: RevenueService;
  let repository: IRevenueRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevenueService,
        {
          provide: IRevenueRepository,
          useValue: {
            createRevenueCurrency: jest.fn(),
            updateRevenue: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RevenueService>(RevenueService);
    repository = module.get<IRevenueRepository>(IRevenueRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should handle revenue', async () => {
    const revenueDto = new RevenueDto('USD' as Currency, 100, new Date());
    jest.spyOn(service, 'updateRevenue').mockResolvedValue(revenueDto);

    await service.handleRevenue(revenueDto);

    expect(service.updateRevenue).toHaveBeenCalledWith(
      revenueDto.currency,
      revenueDto.amount,
    );
  });

  it('should create revenue', async () => {
    const revenueDto = new RevenueDto('USD' as Currency, 100, new Date());
    jest
      .spyOn(repository, 'createRevenueCurrency')
      .mockResolvedValue(revenueDto);

    const result = await service.createRevenue(revenueDto);

    expect(repository.createRevenueCurrency).toHaveBeenCalledWith(revenueDto);
    expect(result).toEqual(revenueDto);
  });

  it('should update revenue', async () => {
    const currency = 'USD' as Currency;
    const amount = 100;
    const revenueDto = new RevenueDto(currency, amount, new Date());
    jest.spyOn(repository, 'updateRevenue').mockResolvedValue(revenueDto);

    const result = await service.updateRevenue(currency, amount);

    expect(repository.updateRevenue).toHaveBeenCalledWith(currency, amount);
    expect(result).toEqual(revenueDto);
  });
});
