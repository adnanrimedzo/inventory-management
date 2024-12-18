import { Inject, Injectable, Logger } from '@nestjs/common';
import { ISettlementService } from '../ports/out/ISettlementService';
import { ISettlementRepository } from '../ports/in/ISettlementRepository';
import { SettlementDto } from '../model/dto/SettlementDto';
import { SettlementStatus } from '../model/enum/SettlementStatus';
import { ILiquidityService } from '../../../liquidity/domain/ports/out/ILiquidityService';
import { IRevenueEventProducer } from '../ports/in/IRevenueEventProducer';
import { RevenueDto } from '../../../revenue/domain/model/dto/RevenueDto';
import { ITransferCompletedEventProducer } from '../ports/in/ITransferCompletedEventProducer';
import { Money } from 'ts-money';
import { Currency } from 'money';

@Injectable()
export class SettlementService implements ISettlementService {
  private readonly logger = new Logger(SettlementService.name);

  constructor(
    @Inject(ISettlementRepository)
    private readonly settlementRepository: ISettlementRepository,
    @Inject(ILiquidityService)
    private readonly liquidityService: ILiquidityService,
    @Inject(IRevenueEventProducer)
    private readonly revenueEventProducer: IRevenueEventProducer,
    @Inject(ITransferCompletedEventProducer)
    private readonly transferCompletedEventProducer: ITransferCompletedEventProducer,
  ) {}

  public async handleSettlement(settlement: SettlementDto) {
    this.logger.log(
      `Handling settlement, transferId: ${settlement.transferId}`,
    );
    await this.settlementRepository.saveSettlement(settlement);
    this.logger.log(
      `Settlement with transferId: ${settlement.transferId} saved`,
    );
  }

  public async processSettlement(
    currency: string,
    size: number,
  ): Promise<number> {
    this.logger.log(`Processing settlements for currency ${currency}`);
    const settlementDtos =
      await this.settlementRepository.findSettlementByStatusAndCurrency(
        SettlementStatus.PENDING,
        currency,
        size,
      );

    if (settlementDtos.length === 0) {
      this.logger.log(`No settlements to process for currency ${currency}`);
      return 0;
    }

    const totalAmount = this.getTotalAmount(settlementDtos);
    const totalMargin = this.getTotalMargin(settlementDtos);
    const liquidityUpdateAmount = this.getLiquidityUpdateAmount(
      totalAmount,
      totalMargin,
      currency,
    );
    this.logger.log(
      `Currency: ${currency} Total amount: ${totalAmount} total margin(revenue): ${totalMargin} liquidity amount: ${liquidityUpdateAmount}`,
    );
    await this.publishRevenueUpdateEvent(currency, totalMargin);
    await this.liquidityService.updateLiquidity(
      currency,
      liquidityUpdateAmount,
    );

    for (const settlement of settlementDtos) {
      await this.settlementRepository.updateSettlementStatus(
        settlement.id,
        SettlementStatus.COMPLETED,
      );

      this.transferCompletedEventProducer.publishTransferCompletedEvent(
        settlement.transferId,
      );
    }

    this.logger.log(`Settlements processed for currency ${currency}`);
    return settlementDtos.length;
  }

  private getLiquidityUpdateAmount(
    totalAmount: number,
    totalMargin: number,
    currency: Currency,
  ) {
    return new Money(totalAmount, currency).subtract(
      new Money(totalMargin, currency),
    ).amount;
  }

  private getTotalMargin(settlementDtos: SettlementDto[]) {
    return settlementDtos.reduce(
      (accumulator, settlement) =>
        accumulator +
        new Money(settlement.amount, settlement.currencyX).multiply(
          settlement.margin,
          Math.ceil,
        ).amount,
      0,
    );
  }

  private getTotalAmount(settlementDtos: SettlementDto[]) {
    return settlementDtos.reduce(
      (accumulator, settlement) =>
        accumulator + new Money(settlement.amount, settlement.currencyX).amount,
      0,
    );
  }

  private async publishRevenueUpdateEvent(
    currency: string,
    revenueAmount: number,
  ) {
    this.logger.log(`Publishing revenue update event for currency ${currency}`);
    await this.revenueEventProducer.publishRevenueEvent(
      new RevenueDto(currency, revenueAmount, new Date()),
    );
    this.logger.log(`Revenue update event published for currency ${currency}`);
  }
}
