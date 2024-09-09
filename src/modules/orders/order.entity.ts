import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../users/user.entity';
import { OrderDetailsEntity } from './orderDetails.entity';
import { PassengerEntity } from './passenger.entity';

@Entity('orders')
export class OrderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderDate: Date;

  @Column('numeric')
  totalPrice: number;

    @Column({
    nullable: true,
  })
  stripeSessionId: string;

  @Column({
    default: 'PENDING'
  })
  status: string;

  @Column({
    default: true,
  })
  isActive: boolean;


  @ManyToOne(() => UserEntity, (user) => user.order)
  user: UserEntity;

  @OneToMany(() => OrderDetailsEntity, (orderDetails) => orderDetails.order)
  orderDetails: OrderDetailsEntity[];

  @OneToMany(() => PassengerEntity, (passenger) => passenger.order, { cascade: true })
  passengers: PassengerEntity[];

  @Column({ default: false })
  medicalInsurance: boolean;
}
