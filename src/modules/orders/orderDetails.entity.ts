// import {
//   Column,
//   Entity,
//   ManyToMany,
//   OneToOne,
//   PrimaryGeneratedColumn,
// } from 'typeorm';
// import { OrderEntity } from './order.entity';
// import { ProductEntity } from '../products/product.entity';

// @Entity('orderDetails')
// export class OrderDetailsEntity {
//   @PrimaryGeneratedColumn('uuid')
//   id: string;

//   @Column()
//   price: number;

//   @Column()
//   orderId: string;

// /*   @OneToOne(() => OrderEntity, (order) => order.orderDetails)
//   order: OrderEntity; */

//   @ManyToMany(() => ProductEntity, (product) => product.orderDetails)
//   product: ProductEntity[];
// }

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';
import { ProductEntity } from '../products/product.entity';

@Entity('order_details')
export class OrderDetailsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @Column()
  isAdult: boolean;

  @ManyToOne(() => OrderEntity, (order) => order.details)
  @JoinColumn({ name: 'order_id' })
  order: OrderEntity;

  @ManyToOne(() => ProductEntity)
  @JoinColumn({ name: 'product_id' })
  product: ProductEntity;
}
