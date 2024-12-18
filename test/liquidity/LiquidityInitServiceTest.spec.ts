import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { LiquidityInitService } from '../../src/liquidity/domain/service/init/LiquidityInitService';
import { ILiquidityRepository } from '../../src/liquidity/domain/ports/in/ILiquidityRepository';
import { LiquidityDto } from '../../src/liquidity/domain/model/dto/LiquidityDto';

describe('LiquidityInitService', () => {
  let service: LiquidityInitService;
  let repository: ILiquidityRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiquidityInitService,
        {
          provide: ILiquidityRepository,
          useValue: {
            createLiquidityForCurrency: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LiquidityInitService>(LiquidityInitService);
    repository = module.get<ILiquidityRepository>(ILiquidityRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should initialize supported currencies', async () => {
    const supportedCurrencies = ['USD', 'EUR'];
    process.env.SUPPORTED_CURRENCIES = supportedCurrencies.join(',');
    process.env.INIT_CURRENCY_LIQUIDITY = '100,200';
    process.env.ENV = 'dev';

    jest
      .spyOn(repository, 'createLiquidityForCurrency')
      .mockImplementation(async (dto: LiquidityDto) => {
        if (dto.currency === 'USD') {
          throw new Error('Liquidity already created USD');
        }
        return dto;
      });

    await service['init'](supportedCurrencies, 0, true, ['100', '200']);
    await service['init'](supportedCurrencies, 1, true, ['100', '200']);

    expect(repository.createLiquidityForCurrency).toHaveBeenCalledWith(
      new LiquidityDto('USD', 100, expect.any(Date)),
    );
    expect(repository.createLiquidityForCurrency).toHaveBeenCalledWith(
      new LiquidityDto('EUR', 200, expect.any(Date)),
    );
  });

  it('should log error if liquidity already created', async () => {
    const supportedCurrencies = ['USD'];
    process.env.SUPPORTED_CURRENCIES = supportedCurrencies.join(',');
    process.env.INIT_CURRENCY_LIQUIDITY = '100';
    process.env.ENV = 'dev';

    const loggerSpy = jest.spyOn(Logger.prototype, 'log');
    jest
      .spyOn(repository, 'createLiquidityForCurrency')
      .mockImplementation(async () => {
        throw new Error('Liquidity already created USD');
      });

    await service['init'](supportedCurrencies, 0, true, ['100']);

    expect(loggerSpy).toHaveBeenCalledWith('liquidity already created USD');
  });
});
