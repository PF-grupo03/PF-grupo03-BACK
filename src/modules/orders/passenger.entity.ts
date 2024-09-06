import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity('passengers')
export class PassengerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  cellphone: string;

  @Column()
  dni: string;

  @ManyToOne(() => OrderEntity, (order) => order.passengers)
  order: OrderEntity;
}
