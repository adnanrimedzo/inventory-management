import { ISettlementRepository } from '../../domain/ports/in/ISettlementRepository';
import { SettlementDto } from '../../domain/model/dto/SettlementDto';
import { PrismaClient } from '@prisma/client';
import { Injectable, Logger } from '@nestjs/common';
import { SettlementStatus } from '../../domain/model/enum/SettlementStatus';
import { Currency } from 'money';

@Injectable()
export class SettlementRepository implements ISettlementRepository {
  private readonly prisma = new PrismaClient();

  async updateSettlementStatus(
    id: number,
    status: SettlementStatus,
  ): Promise<void> {
    await this.prisma.settlement.update({
      where: {
        id: id,
      },
      data: {
        status: status,
      },
    });
  }

  async findSettlementByStatusAndCurrency(
    status: SettlementStatus,
    currency: Currency,
    size: number,
  ): Promise<SettlementDto[]> {
    const settlements = await this.prisma.settlement.findMany({
      where: {
        status: status,
        currencyX: currency,
      },
      take: size,
    });

    return settlements.map((settlement) => {
      return new SettlementDto(
        Number(settlement.amount),
        settlement.currencyX,
        settlement.currencyY,
        settlement.rate.toNumber(),
        settlement.transferId,
        settlement.date,
        settlement.margin.toNumber(),
        settlement.id,
      );
    });
  }

  async saveSettlement(settlement: SettlementDto): Promise<void> {
    const savedSettlement = await this.prisma.settlement.findFirst({
      where: {
        transferId: settlement.transferId,
      },
    });
    if (savedSettlement) {
      Logger.log(
        `Settlement already exists transferId: ${settlement.transferId}`,
      );
      return;
    }

    try {
      await this.prisma.settlement.create({
        data: {
          amount: settlement.amount,
          currencyX: settlement.currencyX,
          currencyY: settlement.currencyY,
          rate: settlement.rate,
          transferId: settlement.transferId,
          date: settlement.date,
          margin: settlement.margin,
          status: SettlementStatus.PENDING,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        Logger.log('Settlement is already saved');
        return;
      }
      Logger.error(error);
      throw new Error('Error saving settlement');
    }
  }
}
