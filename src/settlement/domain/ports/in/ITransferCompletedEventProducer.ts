export interface ITransferCompletedEventProducer {
  publishTransferCompletedEvent(transferId: number): any;
}

export const ITransferCompletedEventProducer = Symbol(
  'ITransferCompletedEventProducer',
);
