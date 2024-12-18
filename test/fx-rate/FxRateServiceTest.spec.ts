import { Test, TestingModule } from '@nestjs/testing';
import { FxRateService } from '../../src/fx-rate/domain/service/FxRateService';
import { FxRateDto } from '../../src/fx-rate/domain/model/dto/FxRateDto';
import { IFxRateRepository } from '../../src/fx-rate/domain/ports/in/IFxRateRepository';
import { Currency } from 'money';
import { FxCurrencyError } from '../../src/fx-rate/domain/model/errors/FxCurrencyError';

describe('FxRateService', () => {
  let service: FxRateService;
  let repository: IFxRateRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FxRateService,
        {
          provide: IFxRateRepository,
          useValue: {
            getRecentFxRate: jest.fn(),
            updateFxRate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FxRateService>(FxRateService);
    repository = module.get<IFxRateRepository>(IFxRateRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get FX rate', async () => {
    const currencyX = 'USD' as Currency;
    const currencyY = 'EUR' as Currency;
    const fxRateDto = new FxRateDto(currencyX, currencyY, 1.2, new Date());
    jest.spyOn(repository, 'getRecentFxRate').mockResolvedValue(fxRateDto);

    const result = await service.getFxRate(currencyX, currencyY);

    expect(repository.getRecentFxRate).toHaveBeenCalledWith(
      currencyX,
      currencyY,
    );
    expect(result).toEqual(fxRateDto);
  });

  it('should update FX rate', async () => {
    const fxRateDto = new FxRateDto(
      'USD' as Currency,
      'EUR' as Currency,
      1.2,
      new Date(),
    );
    jest.spyOn(repository, 'updateFxRate').mockResolvedValue(undefined);

    await service.updateFxRate(fxRateDto);

    expect(repository.updateFxRate).toHaveBeenCalledWith(fxRateDto);
  });

  it('should throw error for unsupported currencies', async () => {
    const fxRateDto = new FxRateDto(
      'USD' as Currency,
      'INVALID' as Currency,
      1.2,
      new Date(),
    );

    await expect(service.updateFxRate(fxRateDto)).rejects.toThrow(
      FxCurrencyError,
    );
  });

  it('should throw error for same currencies', async () => {
    const fxRateDto = new FxRateDto(
      'USD' as Currency,
      'USD' as Currency,
      1.2,
      new Date(),
    );

    await expect(service.updateFxRate(fxRateDto)).rejects.toThrow(
      FxCurrencyError,
    );
  });
});
