import { SettlementDto } from '../../model/dto/SettlementDto';

export interface ISettlementService {
  handleSettlement(settlementEvent: SettlementDto): any;

  processSettlement(currency: string, size: number): Promise<number>;
}

export const ISettlementService = Symbol('ISettlementService');
