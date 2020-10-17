import { Body, Controller, Post } from '@nestjs/common';
import { ExchangeDto } from './dto/exchange.dto';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('exchange')
  async exchange(@Body() exchangeDto: ExchangeDto): Promise<string> {
    return this.walletService.exchange(exchangeDto);
  }
}
