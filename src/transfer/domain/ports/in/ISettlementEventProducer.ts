import { SettlementDto } from '../../../../settlement/domain/model/dto/SettlementDto';

export interface ISettlementEventProducer {
  publishSettlementEvent(settlementEvent: SettlementDto): any;
}

export const ISettlementEventProducer = Symbol('ISettlementEventProducer');
