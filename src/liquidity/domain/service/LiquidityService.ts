import { Inject, Injectable, Logger } from '@nestjs/common';
import { LiquidityDto } from '../model/dto/LiquidityDto';
import { ILiquidityService } from '../ports/out/ILiquidityService';
import { ILiquidityRepository } from '../ports/in/ILiquidityRepository';
import { Currency } from 'money';

@Injectable()
export class LiquidityService implements ILiquidityService {
  constructor(
    @Inject(ILiquidityRepository)
    private liquidityRepository: ILiquidityRepository,
  ) {}

  private readonly logger = new Logger(LiquidityService.name);

  async createLiquidity(liquidityDto: LiquidityDto): Promise<LiquidityDto> {
    return this.liquidityRepository.createLiquidityForCurrency(liquidityDto);
  }

  async updateLiquidity(
    currency: Currency,
    amount: number,
  ): Promise<LiquidityDto> {
    this.logger.log(
      `Updating liquidity for currency ${currency} with amount ${amount}`,
    );
    return await this.liquidityRepository.updateLiquidity(currency, amount);
  }
}
