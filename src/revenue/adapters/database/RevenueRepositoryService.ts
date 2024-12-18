import { IRevenueRepository } from '../../domain/ports/in/IRevenueRepository';
import { RevenueDto } from '../../domain/model/dto/RevenueDto';
import { Prisma, PrismaClient } from '@prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import { RevenueError } from '../../domain/model/errors/RevenueError';

@Injectable()
export class RevenueRepository implements IRevenueRepository {
  private readonly prisma = new PrismaClient();
  async createRevenueCurrency(revenueDto: RevenueDto): Promise<RevenueDto> {
    const liquidity = await this.prisma.revenue.findFirst({
      where: {
        currency: revenueDto.currency,
      },
    });

    if (liquidity) {
      throw new RevenueError(
        `Liquidity already exists for the currency ${revenueDto.currency}`,
      );
    }

    try {
      const savedLiquidity = await this.prisma.revenue.create({
        data: {
          currency: revenueDto.currency,
          amount: revenueDto.amount,
          version: 1,
        },
      });

      return new RevenueDto(
        savedLiquidity.currency,
        Number(savedLiquidity.amount),
        savedLiquidity.date,
        savedLiquidity.id,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new RevenueError('Liquidity is already saved');
      }

      Logger.error(error);
      throw new RevenueError('Error saving liquidity');
    }
  }

  async updateRevenue(currency: string, amount: number): Promise<RevenueDto> {
    const liquidity = await this.prisma.revenue.findFirst({
      where: {
        currency: currency,
      },
    });

    if (!liquidity) {
      throw new RevenueError(
        `Revenue does not exist for the currency ${currency}`,
      );
    }

    try {
      const savedLiquidity = await this.prisma.revenue.update({
        data: {
          amount: liquidity.amount + BigInt(amount),
          version: liquidity.version + 1,
        },
        where: {
          currency: currency,
          version: liquidity.version,
        },
      });

      return new RevenueDto(
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
      throw new RevenueError('Error updating liquidity');
    }
  }
}
