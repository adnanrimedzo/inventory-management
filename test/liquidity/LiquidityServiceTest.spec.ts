import { Test, TestingModule } from '@nestjs/testing';
import { LiquidityService } from '../../src/liquidity/domain/service/LiquidityService';
import { LiquidityDto } from '../../src/liquidity/domain/model/dto/LiquidityDto';
import { Currency } from 'money';
import { ILiquidityRepository } from '../../src/liquidity/domain/ports/in/ILiquidityRepository';

describe('LiquidityService', () => {
  let service: LiquidityService;
  let repository: ILiquidityRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiquidityService,
        {
          provide: ILiquidityRepository,
          useValue: {
            createLiquidityForCurrency: jest.fn(),
            updateLiquidity: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LiquidityService>(LiquidityService);
    repository = module.get<ILiquidityRepository>(ILiquidityRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create liquidity', async () => {
    const liquidityDto = new LiquidityDto('USD' as Currency, 100, new Date());
    jest
      .spyOn(repository, 'createLiquidityForCurrency')
      .mockResolvedValue(liquidityDto);

    const result = await service.createLiquidity(liquidityDto);

    expect(repository.createLiquidityForCurrency).toHaveBeenCalledWith(
      liquidityDto,
    );
    expect(result).toEqual(liquidityDto);
  });

  it('should update liquidity', async () => {
    const currency = 'USD' as Currency;
    const amount = 100;
    const liquidityDto = new LiquidityDto(currency, amount, new Date());
    jest.spyOn(repository, 'updateLiquidity').mockResolvedValue(liquidityDto);

    const result = await service.updateLiquidity(currency, amount);

    expect(repository.updateLiquidity).toHaveBeenCalledWith(currency, amount);
    expect(result).toEqual(liquidityDto);
  });
});
