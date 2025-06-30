import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('PaymentType')
export class PaymentType {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ type: 'varchar', length: 255 })
  PaymentType: string;
}