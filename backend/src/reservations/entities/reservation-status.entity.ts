import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('ReservationStatus')
export class ReservationStatus {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ type: 'varchar', length: 255 })
  Status: string;
}