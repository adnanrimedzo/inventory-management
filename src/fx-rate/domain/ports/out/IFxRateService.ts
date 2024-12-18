import { FxRateDto } from '../../model/dto/FxRateDto';
import { Currency } from 'money';

export interface IFxRateService {
  updateFxRate(fxRate: FxRateDto): any;

  getFxRate(currencyX: Currency, currencyY: Currency): Promise<FxRateDto>;
}

export const IFxRateService = Symbol('IFxRateService');
