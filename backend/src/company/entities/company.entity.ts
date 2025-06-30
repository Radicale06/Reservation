import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Company')
export class Company {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ type: 'varchar', length: 255 })
  Company: string;

  @Column({ type: 'varchar', length: 255 })
  TaxIdentificationNumber: string;

  @Column({ type: 'varchar', length: 255 })
  Address: string;

  @Column({ type: 'varchar', length: 255 })
  Phone: string;

  @Column({ type: 'blob', nullable: true })
  Logo: Buffer;
}