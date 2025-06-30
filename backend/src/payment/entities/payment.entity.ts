import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Payment')
export class Payment {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column()
  PaiementTypeId: number;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  Amount: number;

  @Column()
  ReservationId: number;

  @Column({ type: 'datetime' })
  CreatedAt: Date;
}