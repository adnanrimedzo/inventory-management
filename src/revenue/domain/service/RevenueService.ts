import { Inject, Injectable } from '@nestjs/common';
import { RevenueDto } from '../model/dto/RevenueDto';
import { IRevenueService } from '../ports/out/IRevenueService';
import { IRevenueRepository } from '../ports/in/IRevenueRepository';
import { Currency } from 'money';

@Injectable()
export class RevenueService implements IRevenueService {
  constructor(
    @Inject(IRevenueRepository)
    private readonly revenueRepository: IRevenueRepository,
  ) {}

  async handleRevenue(revenueDto: RevenueDto) {
    await this.updateRevenue(revenueDto.currency, revenueDto.amount);
  }

  async createRevenue(revenueDto: RevenueDto): Promise<RevenueDto> {
    return this.revenueRepository.createRevenueCurrency(revenueDto);
  }

  async updateRevenue(currency: Currency, amount: number): Promise<RevenueDto> {
    return this.revenueRepository.updateRevenue(currency, amount);
  }
}
