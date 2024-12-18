import { RevenueDto } from '../../../../revenue/domain/model/dto/RevenueDto';

export interface IRevenueEventProducer {
  publishRevenueEvent(revenueDto: RevenueDto): any;
}

export const IRevenueEventProducer = Symbol('IRevenueEventProducer');
