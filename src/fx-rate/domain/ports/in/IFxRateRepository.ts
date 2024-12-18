import { FxRateDto } from '../../model/dto/FxRateDto';

export interface IFxRateRepository {
  updateFxRate(fxRate: FxRateDto): any;
  getRecentFxRate(currencyX: string, currencyY: string): Promise<FxRateDto>;
}

export const IFxRateRepository = Symbol('IFxRateRepository');
