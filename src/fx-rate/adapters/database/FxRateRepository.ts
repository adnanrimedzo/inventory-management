import { IFxRateRepository } from '../../domain/ports/in/IFxRateRepository';
import { FxRateDto } from '../../domain/model/dto/FxRateDto';
import { PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { FxRateError } from '../../../settlement/domain/model/errors/FxRateError';

@Injectable()
export class FxRateRepository implements IFxRateRepository {
  private readonly prisma = new PrismaClient();
  async getRecentFxRate(
    currencyX: string,
    currencyY: string,
  ): Promise<FxRateDto> {
    const fxRate = await this.prisma.fxRate.findFirst({
      where: {
        currencyX: currencyX,
        currencyY: currencyY,
      },
      orderBy: {
        date: 'desc',
      },
    });

    if (!fxRate) {
      throw new FxRateError(
        `FxRate not found for the currency pair ${currencyX}/${currencyY}`,
      );
    }

    return new FxRateDto(
      fxRate.currencyX,
      fxRate.currencyY,
      fxRate.rate.toNumber(),
      fxRate.date,
      fxRate.id,
    );
  }

  async updateFxRate(fxRate: FxRateDto): Promise<void> {
    await this.prisma.fxRate.create({
      data: {
        currencyX: fxRate.currencyX,
        currencyY: fxRate.currencyY,
        rate: fxRate.rate,
        date: fxRate.timestamp,
      },
    });
  }
}
