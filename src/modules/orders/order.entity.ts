import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { OrderDetailsEntity } from './orderDetails.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  date: Date;

  @Column({
    nullable: true,
  })
  stripeSessionId: string;

  @Column({
    default: 'PENDING'
  })
  status: string;

/*   @ManyToOne(() => UserEntity, (user) => user.order)
  user: UserEntity;

  @OneToOne(() => OrderDetailsEntity, (orderDetails) => orderDetails.order)
  orderDetails: OrderDetailsEntity; */
}
