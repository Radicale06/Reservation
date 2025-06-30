import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Court')
export class Court {
  @PrimaryGeneratedColumn()
  Id: number;

  @Column({ type: 'varchar', length: 255 })
  Name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  Description: string;

  @Column({ type: 'varchar', length: 255 })
  Type: string;

  @Column({ type: 'blob', nullable: true })
  Image: Buffer;

  @Column({ type: 'bit', default: true })
  IsActive: boolean;

  @Column({ type: 'datetime' })
  CreatedAt: Date;

}