import { RevenueDto } from '../../model/dto/RevenueDto';
import { Currency } from 'money';

export interface IRevenueService {
  createRevenue(revenueDto: RevenueDto): Promise<RevenueDto>;
  updateRevenue(currency: Currency, amount: number): Promise<RevenueDto>;
  handleRevenue(revenueDto: RevenueDto): any;
}

export const IRevenueService = Symbol('IRevenueService');
