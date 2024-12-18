import { ILiquidityRepository } from '../../domain/ports/in/ILiquidityRepository';
import { LiquidityDto } from '../../domain/model/dto/LiquidityDto';
import { Prisma, PrismaClient } from '@prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import { LiquidityError } from '../../domain/model/errors/LiquidityError';
import { RevenueError } from '../../../revenue/domain/model/errors/RevenueError';

@Injectable()
export class LiquidityRepository implements ILiquidityRepository {
  private readonly prisma = new PrismaClient();

  async findLiquidityByCurrency(currency: string): Promise<LiquidityDto> {
    const liquidity = await this.prisma.liquidity.findFirst({
      where: {
        currency: currency,
      },
    });

    if (!liquidity) {
      return null;
    }

    return new LiquidityDto(
      liquidity.currency,
      Number(liquidity.amount),
      liquidity.date,
      liquidity.id,
    );
  }

  async findLiquidityHistoryByCurrency(
    currency: string,
    size: number,
  ): Promise<number[]> {
    const liquidityHistories = await this.prisma.liquidityHistory.findMany({
      where: {
        currency: currency,
      },
      take: size,
      orderBy: {
        date: 'desc',
      },
    });

    return liquidityHistories.map((liquidityHistory) =>
      Number(liquidityHistory.amount),
    );
  }

  async createLiquidityForCurrency(
    liquidityDto: LiquidityDto,
  ): Promise<LiquidityDto> {
    const liquidity = await this.prisma.liquidity.findFirst({
      where: {
        currency: liquidityDto.currency,
      },
    });

    if (liquidity) {
      throw new LiquidityError(
        `Liquidity already exists for the currency ${liquidityDto.currency}`,
      );
    }

    try {
      const savedLiquidity = await this.prisma.liquidity.create({
        data: {
          currency: liquidityDto.currency,
          amount: liquidityDto.amount,
          version: 1,
        },
      });

      return new LiquidityDto(
        savedLiquidity.currency,
        Number(savedLiquidity.amount),
        savedLiquidity.date,
        savedLiquidity.id,
      );
    } catch (error) {
      Logger.error(error);
      throw new LiquidityError('Error saving liquidity');
    }
  }

  async updateLiquidity(
    currency: string,
    amount: number,
  ): Promise<LiquidityDto> {
    const liquidity = await this.prisma.liquidity.findFirst({
      where: {
        currency: currency,
      },
    });

    if (!liquidity) {
      throw new LiquidityError(
        `Liquidity does not exist for the currency ${currency}`,
      );
    }

    if (liquidity.amount + BigInt(amount) < 0) {
      throw new LiquidityError(
        `Liquidity is not enough for currency: ${currency}`,
      );
    }

    try {
      const savedLiquidity = await this.prisma.liquidity.update({
        data: {
          amount: liquidity.amount + BigInt(amount),
          version: liquidity.version + 1,
        },
        where: {
          currency: currency,
          version: liquidity.version,
        },
      });

      await this.prisma.liquidityHistory.create({
        data: {
          currency: savedLiquidity.currency,
          amount: savedLiquidity.amount,
          date: savedLiquidity.date,
        },
      });

      return new LiquidityDto(
        savedLiquidity.currency,
        Number(savedLiquidity.amount),
        savedLiquidity.date,
        savedLiquidity.id,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new RevenueError(
          'Version conflict: The liquidity record was updated by another transaction',
        );
      }

      Logger.error(error);
      throw new LiquidityError('Error updating liquidity');
    }
  }
}
