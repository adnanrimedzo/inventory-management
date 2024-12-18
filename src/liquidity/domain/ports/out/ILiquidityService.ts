import { LiquidityDto } from '../../model/dto/LiquidityDto';
import { Currency } from 'money';

export interface ILiquidityService {
  createLiquidity(liquidityDto: LiquidityDto): Promise<LiquidityDto>;

  updateLiquidity(currency: Currency, amount: number): Promise<LiquidityDto>;
}

export const ILiquidityService = Symbol('ILiquidityService');
