import { Inject, Injectable, Logger } from '@nestjs/common';
import { ILiquidityRepository } from '../../ports/in/ILiquidityRepository';
import * as process from 'node:process';
import { LiquidityDto } from '../../model/dto/LiquidityDto';

@Injectable()
export class LiquidityInitService {
  private readonly logger = new Logger(LiquidityInitService.name);

  constructor(
    @Inject(ILiquidityRepository)
    private readonly liquidityRepository: ILiquidityRepository,
  ) {
    const isLocal = process.env.ENV === 'dev';
    const initAmounts = process.env.INIT_CURRENCY_LIQUIDITY.split(',');
    const supportedCurrencies = process.env.SUPPORTED_CURRENCIES.split(',');

    for (let i = 0; i < supportedCurrencies.length; i++) {
      this.init(supportedCurrencies, i, isLocal, initAmounts);
    }
  }

  private async init(
    supportedCurrencies,
    i: number,
    isLocal: boolean,
    initAmounts,
  ) {
    const currency = supportedCurrencies[i];
    const amount = isLocal ? parseFloat(initAmounts[i]) : 0;
    try {
      await this.liquidityRepository.createLiquidityForCurrency(
        new LiquidityDto(currency, amount, new Date()),
      );
    } catch (error) {
      this.logger.log('liquidity already created ' + currency);
    }
  }
}
