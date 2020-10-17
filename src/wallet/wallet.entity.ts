import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  address: string;

  @Column()
  masterKey: string;

  @Column({ type: 'real', default: 0 })
  btcBalance: number;

  @Column({ type: 'real', default: 0 })
  ethBalance: number;
}
