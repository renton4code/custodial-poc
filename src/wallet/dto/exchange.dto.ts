export enum Currency {
  BTC = 'BTC',
  ETH = 'ETH',
}

export class ExchangeDto {
  masterKey: string;
  currency: Currency.BTC | Currency.ETH;
  senderAddress: string;
  targetAddress: string;
  amount: number;
}
