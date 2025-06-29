import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('reservations')
export class Reservation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column()
  reservationDate: Date;

  @Column('time')
  startTime: string;

  @Column('time')
  endTime: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 60 })
  price: number;

  @Column({ 
    type: 'enum', 
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  })
  status: string;

  @Column({ nullable: true })
  paymentId: string;

  @CreateDateColumn()
  createdAt: Date;
}