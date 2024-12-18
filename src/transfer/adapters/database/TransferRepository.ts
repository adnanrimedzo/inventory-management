import { ITransferRepository } from '../../domain/ports/in/ITransferRepository';
import { TransferDto } from '../../domain/model/dto/TransferDto';
import { PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { TransferError } from '../../domain/model/errors/TransferError';
import { TransferStatus } from '../../domain/model/dto/TransferStatus';

@Injectable()
export class TransferRepository implements ITransferRepository {
  private readonly prisma = new PrismaClient();

  async saveTransfer(transfer: TransferDto): Promise<TransferDto> {
    try {
      const prismaTransferClient = await this.prisma.transfer.create({
        data: {
          externalReferenceId: transfer.externalReferenceId,
          senderId: transfer.senderId,
          receiverId: transfer.receiverId,
          amount: transfer.amount,
          currencyX: transfer.currencyX,
          currencyY: transfer.currencyY,
          status: transfer.status,
        },
      });

      return new TransferDto(
        prismaTransferClient.externalReferenceId,
        prismaTransferClient.senderId,
        prismaTransferClient.receiverId,
        Number(prismaTransferClient.amount),
        prismaTransferClient.currencyX,
        prismaTransferClient.currencyY,
        transfer.status,
        prismaTransferClient.id,
        prismaTransferClient.date,
      );
    } catch (error) {
      if (error.code === 'P2002') {
        throw new TransferError('Transfer is already saved');
      }
      throw new TransferError('Error saving transfer');
    }
  }

  async updateTransferStatus(
    transferId: number,
    status: TransferStatus,
  ): Promise<TransferDto> {
    const transfer = await this.prisma.transfer.update({
      where: {
        id: transferId,
      },
      data: {
        status: status,
      },
    });

    return new TransferDto(
      transfer.externalReferenceId,
      transfer.senderId,
      transfer.receiverId,
      Number(transfer.amount),
      transfer.currencyX,
      transfer.currencyY,
      status,
      transfer.id,
      transfer.date,
    );
  }
}
