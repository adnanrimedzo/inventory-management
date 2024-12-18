import { Inject, Injectable, Logger } from '@nestjs/common';
import { ILiquidityRepository } from '../../domain/ports/in/ILiquidityRepository';
import { IFxRateService } from '../../../fx-rate/domain/ports/out/IFxRateService';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as process from 'node:process';
import { Money } from 'ts-money';
import { linearRegression, linearRegressionLine } from 'simple-statistics';

@Injectable()
export class LiquidityBalancerPoller {
  private readonly logger = new Logger(LiquidityBalancerPoller.name);
  private readonly supportedCurrencies: string[];

  constructor(
    @Inject(ILiquidityRepository)
    private liquidityRepository: ILiquidityRepository,
    @Inject(IFxRateService) private fxRateService: IFxRateService,
  ) {
    this.supportedCurrencies = process.env.SUPPORTED_CURRENCIES.split(',');
  }

  @Cron(process.env.LIQUIDITY_BALANCER_CRON || CronExpression.EVERY_4_HOURS)
  async handleCron() {
    this.logger.log('Balancing liquidity');
    await this.balanceLiquidityPools();
    this.logger.log('Liquidity balanced');
  }

  public async balanceLiquidityPools() {
    const usdEquivalentBalances = this.findCurrentUSDEquivalentBalances();
    for (const [currency, usdBalance] of usdEquivalentBalances) {
      if (currency !== 'USD') {
        try {
          const liquidityHistory =
            await this.liquidityRepository.findLiquidityHistoryByCurrency(
              currency,
              1000,
            );
          const forecastedAmount = this.forecastLiquidity(liquidityHistory);
          const fxRate = await this.fxRateService.getFxRate(currency, 'USD');
          const forecastedUSDAmount = this.convertAmount(
            forecastedAmount,
            currency,
            fxRate.rate,
          );

          if (forecastedUSDAmount > usdBalance) {
            const amountUSDToAdd = forecastedUSDAmount - usdBalance;
            const amountToAdd = this.convertAmount(
              amountUSDToAdd,
              'USD',
              1 / fxRate.rate,
            );

            // update pools
            await this.liquidityRepository.updateLiquidity(
              currency,
              amountToAdd,
            );
            this.logger.log(
              `Added ${amountToAdd} to ${currency} liquidity pool`,
            );
            await this.liquidityRepository.updateLiquidity(
              'USD',
              -amountUSDToAdd,
            );
            this.logger.log(`Removed ${amountToAdd} to USD liquidity pool`);
          } else {
            const amountUSDToRemove = usdBalance - forecastedUSDAmount;
            const amountToRemove = this.convertAmount(
              amountUSDToRemove,
              'USD',
              1 / fxRate.rate,
            );

            // update pools
            await this.liquidityRepository.updateLiquidity(
              currency,
              -amountToRemove,
            );
            this.logger.log(
              `Removed ${amountToRemove} from ${currency} liquidity pool`,
            );
            await this.liquidityRepository.updateLiquidity(
              'USD',
              amountToRemove,
            );
            this.logger.log(`Added ${amountToRemove} to USD liquidity pool`);
          }
        } catch (error) {
          this.logger.error(
            `Error balancing liquidity for currency ${currency}`,
          );
          this.logger.error(error);
        }
      }
    }
  }

  public forecastLiquidity(liquidityHistory: number[]): number {
    const regressionData = liquidityHistory.map((amount, index) => [
      index,
      amount,
    ]);
    const regression = linearRegression(regressionData);
    const predict = linearRegressionLine(regression);
    return predict(liquidityHistory.length);
  }

  public findCurrentUSDEquivalentBalances() {
    const initialUSDAmountMap = new Map<string, number>();
    this.supportedCurrencies.forEach(async (currency) => {
      if (currency === 'USD') {
        initialUSDAmountMap.set(currency, 0);
      } else {
        try {
          const fxRate = await this.fxRateService.getFxRate(currency, 'USD');
          const liquidity =
            await this.liquidityRepository.findLiquidityByCurrency(currency);
          const usdLiquidity = this.convertAmount(
            liquidity.amount,
            currency,
            fxRate.rate,
          );
          initialUSDAmountMap.set(currency, usdLiquidity);
        } catch (error) {
          this.logger.error(
            `Error balancing liquidity for currency ${currency}`,
          );
          this.logger.error(error);
        }
      }
    });

    return initialUSDAmountMap;
  }

  public convertAmount(amount: number, currency: string, rate: number) {
    return new Money(amount, currency).multiply(rate, Math.ceil).amount;
  }
}
