import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Court } from '../../court/entities/court.entity';

@Entity('Reservation')
export class Reservation {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ type: 'varchar', length: 255 })
  PlayerFullName: string;

  @Column({ type: 'varchar', length: 255 })
  PlayerPhone: string;

  @Column({ nullable: true })
  CourtId: number;

  @ManyToOne(() => Court)
  @JoinColumn({ name: 'CourtId' })
  court: Court;

  @Column({ type: 'varchar', length: 255 })
  StartTime: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  EndTime: string;

  @Column({ type: 'date' })
  Date: Date;

  @Column({ type: 'decimal', precision: 18, scale: 3 })
  Price: number;

  @Column({ type: 'int' })
  Status: number;

  @Column({ type: 'bit', default: false })
  IsPaid: boolean;

  @Column({ type: 'datetime' })
  CreatedAt: Date;

  @Column({ type: 'varchar', length: 255 })
  CreatedBy: string;

}