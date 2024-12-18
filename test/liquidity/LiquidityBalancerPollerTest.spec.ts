import { Test, TestingModule } from '@nestjs/testing';
import { LiquidityBalancerPoller } from '../../src/liquidity/adapters/poller/LiquidityBalancerPoller';
import { ILiquidityRepository } from '../../src/liquidity/domain/ports/in/ILiquidityRepository';
import { IFxRateService } from '../../src/fx-rate/domain/ports/out/IFxRateService';
import { Logger } from '@nestjs/common';

describe('LiquidityBalancerPoller', () => {
  let liquidityBalancerPoller: LiquidityBalancerPoller;
  let liquidityRepository: ILiquidityRepository;
  let fxRateService: IFxRateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LiquidityBalancerPoller,
        {
          provide: ILiquidityRepository,
          useValue: {
            findLiquidityHistoryByCurrency: jest.fn(),
            updateLiquidity: jest.fn(),
            findLiquidityByCurrency: jest.fn(),
          },
        },
        {
          provide: IFxRateService,
          useValue: {
            getFxRate: jest.fn(),
          },
        },
        Logger,
      ],
    }).compile();

    liquidityBalancerPoller = module.get<LiquidityBalancerPoller>(
      LiquidityBalancerPoller,
    );
    liquidityRepository =
      module.get<ILiquidityRepository>(ILiquidityRepository);
    fxRateService = module.get<IFxRateService>(IFxRateService);
  });

  it('should be defined', () => {
    expect(liquidityBalancerPoller).toBeDefined();
  });

  describe('handleCron', () => {
    it('should log balancing liquidity', async () => {
      const logSpy = jest.spyOn(Logger.prototype, 'log');
      jest
        .spyOn(liquidityBalancerPoller, 'balanceLiquidityPools')
        .mockImplementation(async () => {});

      await liquidityBalancerPoller.handleCron();

      expect(logSpy).toHaveBeenCalledWith('Balancing liquidity');
      expect(logSpy).toHaveBeenCalledWith('Liquidity balanced');
    });
  });

  describe('forecastLiquidity', () => {
    it('should forecast liquidity', () => {
      const liquidityHistory = [100, 200, 300, 400];
      const forecastedAmount =
        liquidityBalancerPoller.forecastLiquidity(liquidityHistory);
      expect(forecastedAmount).toBeGreaterThan(0);
    });
  });

  describe('convertAmount', () => {
    it('should convert amount correctly', () => {
      const amount = 100;
      const rate = 1.2;
      const convertedAmount = liquidityBalancerPoller.convertAmount(
        amount,
        'USD',
        rate,
      );
      expect(convertedAmount).toBe(120);
    });
  });
});
