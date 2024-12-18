import { LiquidityDto } from '../../model/dto/LiquidityDto';

export interface ILiquidityRepository {
  createLiquidityForCurrency(liquidityDto: LiquidityDto): Promise<LiquidityDto>;
  updateLiquidity(currency: string, amount: number): Promise<LiquidityDto>;
  findLiquidityByCurrency(currency: string): Promise<LiquidityDto>;
  findLiquidityHistoryByCurrency(
    currency: string,
    size: number,
  ): Promise<number[]>;
}

export const ILiquidityRepository = Symbol('ILiquidityRepository');
