import { Inject, Injectable, Logger } from '@nestjs/common';
import { TransferDto } from '../model/dto/TransferDto';
import { ITransferService } from '../ports/out/ITransferService';
import { ITransferRepository } from '../ports/in/ITransferRepository';
import { IFxRateService } from '../../../fx-rate/domain/ports/out/IFxRateService';
import { TransferError } from '../model/errors/TransferError';
import { ISettlementEventProducer } from '../ports/in/ISettlementEventProducer';
import fx, { Currency } from 'money';
import { FxRateDto } from '../../../fx-rate/domain/model/dto/FxRateDto';
import { SettlementDto } from '../../../settlement/domain/model/dto/SettlementDto';
import { ILiquidityService } from '../../../liquidity/domain/ports/out/ILiquidityService';
import { TransferFxService } from './TransferFxService';
import * as process from 'node:process';
import { TransferStatus } from '../model/dto/TransferStatus';

@Injectable()
export class TransferService implements ITransferService {
  private readonly supportedCurrencies: Currency[];

  private readonly margin: number;

  constructor(
    @Inject(ITransferRepository)
    private readonly transferRepository: ITransferRepository,
    @Inject(IFxRateService) private readonly fxRateService: IFxRateService,
    @Inject(ILiquidityService)
    private readonly liquidityService: ILiquidityService,
    @Inject(ISettlementEventProducer)
    private readonly settlementEventProducer: ISettlementEventProducer,
  ) {
    this.supportedCurrencies = process.env.SUPPORTED_CURRENCIES.split(
      ',',
    ) as fx.Currency[];

    this.margin = parseFloat(process.env.MARGIN);
  }

  async updateTransferStatus(transferId: number, status: TransferStatus) {
    await this.transferRepository.updateTransferStatus(transferId, status);
  }

  private readonly logger = new Logger(TransferService.name);

  async processTransfer(transfer: TransferDto) {
    this.logger.log(`Processing transfer ${transfer.id}`);
    this.validateCurrencies(this.supportedCurrencies, transfer);

    // get fx rate
    const fxRate = await this.fxRateService.getFxRate(
      transfer.currencyX,
      transfer.currencyY,
    );

    // update liquidity for currencyY immediately
    await this.liquidityService.updateLiquidity(
      transfer.currencyY,
      TransferFxService.getDestinationCurrencyAmount(
        transfer.amount,
        transfer.currencyX,
        fxRate.rate,
        this.margin,
      ) * -1,
    );

    // save transfer
    const savedTransfer = await this.transferRepository.saveTransfer(transfer);

    // publish settlement event
    await this.publishNewTransferEvent(savedTransfer, fxRate);
    this.logger.log(`Transfer ${savedTransfer.id} processed`);
  }

  private async publishNewTransferEvent(
    transfer: TransferDto,
    fxRate: FxRateDto,
  ) {
    const settlementEvent = new SettlementDto(
      transfer.amount,
      transfer.currencyX,
      transfer.currencyY,
      fxRate.rate,
      transfer.id,
      transfer.createdAt,
      this.margin,
    );
    await this.settlementEventProducer.publishSettlementEvent(settlementEvent);
    this.logger.log(`Settlement event published for transfer ${transfer.id}`);
  }

  private validateCurrencies(
    supportedCurrencies: fx.Currency[],
    transfer: TransferDto,
  ) {
    if (
      !supportedCurrencies.includes(transfer.currencyX) ||
      !supportedCurrencies.includes(transfer.currencyY)
    ) {
      throw new TransferError(
        `Currency must be a valid currency code: ${supportedCurrencies}`,
      );
    }
  }
}
