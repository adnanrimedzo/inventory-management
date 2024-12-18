import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { RevenueInitService } from '../../src/revenue/domain/service/init/RevenueInitService';
import { IRevenueRepository } from '../../src/revenue/domain/ports/in/IRevenueRepository';
import { RevenueDto } from '../../src/revenue/domain/model/dto/RevenueDto';

describe('RevenueInitService', () => {
  let service: RevenueInitService;
  let repository: IRevenueRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevenueInitService,
        {
          provide: IRevenueRepository,
          useValue: {
            createRevenueCurrency: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RevenueInitService>(RevenueInitService);
    repository = module.get<IRevenueRepository>(IRevenueRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize supported currencies', async () => {
    const supportedCurrencies = ['USD', 'EUR'];
    process.env.SUPPORTED_CURRENCIES = supportedCurrencies.join(',');

    jest
      .spyOn(repository, 'createRevenueCurrency')
      .mockImplementation(async (dto: RevenueDto) => {
        if (dto.currency === 'USD') {
          throw new Error('Revenue already created USD');
        }
        return dto;
      });

    await service['init'](supportedCurrencies, 0);
    await service['init'](supportedCurrencies, 1);

    expect(repository.createRevenueCurrency).toHaveBeenCalledWith(
      new RevenueDto('USD', 0, expect.any(Date)),
    );
    expect(repository.createRevenueCurrency).toHaveBeenCalledWith(
      new RevenueDto('EUR', 0, expect.any(Date)),
    );
  });

  it('should log error if revenue already created', async () => {
    const supportedCurrencies = ['USD'];
    process.env.SUPPORTED_CURRENCIES = supportedCurrencies.join(',');

    const loggerSpy = jest.spyOn(Logger.prototype, 'log');
    jest
      .spyOn(repository, 'createRevenueCurrency')
      .mockImplementation(async () => {
        throw new Error('Revenue already created USD');
      });

    await service['init'](supportedCurrencies, 0);

    expect(loggerSpy).toHaveBeenCalledWith('Revenue already created USD');
  });
});
