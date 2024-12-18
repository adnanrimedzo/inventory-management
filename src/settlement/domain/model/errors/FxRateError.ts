export class FxRateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FxRateError';
  }
}
