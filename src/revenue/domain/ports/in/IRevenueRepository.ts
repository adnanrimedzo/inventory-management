import { RevenueDto } from '../../model/dto/RevenueDto';

export interface IRevenueRepository {
  createRevenueCurrency(revenueDto: RevenueDto): Promise<RevenueDto>;
  updateRevenue(currency: string, amount: number): Promise<RevenueDto>;
}

export const IRevenueRepository = Symbol('IRevenueRepository');
