import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

import { loadFixtures } from '../seed-db/seed';

import { WalletModule } from './wallet/wallet.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
    }),
    WalletModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {
  constructor(private connection: Connection) {}

  async onModuleInit() {
    // seed database with sample wallets
    return loadFixtures('Wallet', this.connection);
  }
}
