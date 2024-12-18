import { Inject, Injectable, Logger } from '@nestjs/common';
import { FxRateDto } from '../model/dto/FxRateDto';
import { IFxRateService } from '../ports/out/IFxRateService';
import { IFxRateRepository } from '../ports/in/IFxRateRepository';
import { Currency } from 'money';
import { FxCurrencyError } from '../model/errors/FxCurrencyError';
import * as process from 'node:process';

@Injectable()
export class FxRateService implements IFxRateService {
  private readonly supportedCurrencies: Currency[];
  private readonly logger = new Logger(FxRateService.name);

  constructor(
    @Inject(IFxRateRepository)
    private fxRateRepository: IFxRateRepository,
  ) {
    this.supportedCurrencies = process.env.SUPPORTED_CURRENCIES.split(
      ',',
    ) as Currency[];
  }

  async getFxRate(
    currencyX: Currency,
    currencyY: Currency,
  ): Promise<FxRateDto> {
    return await this.fxRateRepository.getRecentFxRate(currencyX, currencyY);
  }

  async updateFxRate(fxRate: FxRateDto): Promise<void> {
    this.validateCurrencies(fxRate);
    await this.fxRateRepository.updateFxRate(fxRate);
    this.logger.log(`FxRate updated: ${fxRate.currencyX}/${fxRate.currencyY}`);
  }

  private validateCurrencies(fxRate: FxRateDto) {
    if (
      !this.supportedCurrencies.includes(fxRate.currencyX) ||
      !this.supportedCurrencies.includes(fxRate.currencyY)
    ) {
      throw new FxCurrencyError(
        `Currency must be a valid currency code: ${this.supportedCurrencies}`,
      );
    }
    if (fxRate.currencyX === fxRate.currencyY) {
      throw new FxCurrencyError('Currency X and Y must be different');
    }
  }
}
