import { SettlementDto } from '../../model/dto/SettlementDto';
import { SettlementStatus } from '../../model/enum/SettlementStatus';
import { Currency } from 'money';

export interface ISettlementRepository {
  saveSettlement(settlement: SettlementDto): any;

  findSettlementByStatusAndCurrency(
    status: SettlementStatus,
    currency: Currency,
    size: number,
  ): Promise<SettlementDto[]>;

  updateSettlementStatus(id: number, status: SettlementStatus): Promise<void>;
}

export const ISettlementRepository = Symbol('ISettlementRepository');
