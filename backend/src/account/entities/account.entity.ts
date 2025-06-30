import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Account')
export class Account {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ type: 'varchar', length: 255 })
  UserName: string;

  @Column({ type: 'varchar', length: 255 })
  Password: string;

  @Column({ type: 'varchar', length: 255 })
  FullName: string;

  @Column({ type: 'datetime' })
  CreatedAt: Date;

  @Column({ type: 'varchar', length: 255 })
  CreatedBy: string;
}