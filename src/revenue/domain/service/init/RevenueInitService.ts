import { Inject, Injectable, Logger } from '@nestjs/common';
import * as process from 'node:process';
import { IRevenueRepository } from '../../ports/in/IRevenueRepository';
import { RevenueDto } from '../../model/dto/RevenueDto';

@Injectable()
export class RevenueInitService {
  private readonly logger = new Logger(RevenueInitService.name);

  constructor(
    @Inject(IRevenueRepository)
    private readonly revenueRepository: IRevenueRepository,
  ) {
    const supportedCurrencies = process.env.SUPPORTED_CURRENCIES.split(',');

    for (let i = 0; i < supportedCurrencies.length; i++) {
      this.init(supportedCurrencies, i);
    }
  }

  private async init(supportedCurrencies, i: number) {
    const currency = supportedCurrencies[i];
    try {
      await this.revenueRepository.createRevenueCurrency(
        new RevenueDto(currency, 0, new Date()),
      );
    } catch (error) {
      this.logger.log('Revenue already created ' + currency);
    }
  }
}
