import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';
import { compare } from 'bcrypt';

import { comissionRate } from '../../constants';
import { Currency, ExchangeDto } from './dto/exchange.dto';
import { Wallet } from './wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    private readonly connection: Connection,
  ) {}

  async exchange(exchangeDto: ExchangeDto): Promise<string> {

    const {
      masterKey,
      senderAddress,
      targetAddress,
      currency,
      amount,
    } = exchangeDto;

    const senderWallet = await this.walletRepository.findOne({ address: senderAddress });

    if (!senderWallet) {
      return 'Sender wallet wasn\'t found';
    }

    const isMasterKeyCorrect = await this.checkMasterKey(masterKey, senderWallet);

    if (!isMasterKeyCorrect) {
      return 'Master key doesn\'t match';
    }

    const targetWallet = await this.walletRepository.findOne({ address:  targetAddress});

    if (!targetWallet) {
      return 'Target wallet wasn\'t found';
    }

    const hasSufficientFunds = this.checkSufficientFunds(senderWallet, currency, amount);

    if (!hasSufficientFunds) {
      return 'Insufficient funds';
    }

    const isOk = await this.makeTransaction(senderWallet, targetWallet, currency, amount);

    if (!isOk) {
      return 'Transaction failed, contact support';
    }

    return 'Success';
  }

  private checkMasterKey(key: string, wallet: Wallet): Promise<boolean> {
    return compare(key, wallet.masterKey);
  }

  private getWithdrawalAmountWithCommission(withdrawal: number) {
    return withdrawal + (withdrawal * comissionRate);
  }

  private checkSufficientFunds(wallet: Wallet, currency: Currency, requestedWithdrawal: number): boolean {
    const requestedWithdrawalWithCommission = this.getWithdrawalAmountWithCommission(requestedWithdrawal);
    switch (currency) {
      case Currency.BTC:
        return wallet.btcBalance - requestedWithdrawalWithCommission > 0;
      case Currency.ETH:
        return wallet.ethBalance - requestedWithdrawalWithCommission > 0;
    }
    return false;
  }

  private async makeTransaction(
    sender: Wallet,
    target: Wallet,
    currency: Currency,
    amount: number,
  ): Promise<boolean> {
    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let balanceColumn = null;

    switch (currency) {
      case Currency.BTC:
        balanceColumn = 'btcBalance';
        break;
      case Currency.ETH:
        balanceColumn = 'ethBalance';
        break;
    }

    if (!balanceColumn) {
      throw `Trying to map unsupported currency = ${currency}`;
    }
    try {
      const withdrawalWithCommission = this.getWithdrawalAmountWithCommission(amount);

      sender[balanceColumn] -= withdrawalWithCommission;
      target[balanceColumn] += amount;

      await queryRunner.manager.save(sender);
      await queryRunner.manager.save(target);

      await queryRunner.commitTransaction();
    } catch(e) {
      console.log(e);
      await queryRunner.rollbackTransaction();
      return false;
    } finally {
      await queryRunner.release();
    }
    return true;
  }
}
