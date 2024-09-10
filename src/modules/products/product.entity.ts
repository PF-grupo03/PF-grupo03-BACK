import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { CategoryEntity } from '../categories/category.entity';
import { OrderDetailsEntity } from '../orders/orderDetails.entity';

@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  image: string;

  @Column()
  image2: string;

  @Column()
  image3: string;

  @Column()
  location: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  description2: string;

  @Column('numeric')
  price: number;

  @Column('numeric')
  stock: number;

  @Column()
  duration: string;

  @Column({
    default: true,
  })
  isActive: boolean;

  @ManyToMany(() => CategoryEntity)
  @JoinTable()
  categories: CategoryEntity[];

  @OneToMany(() => OrderDetailsEntity, (orderDetails) => orderDetails.product)
  orderDetails: OrderDetailsEntity[];

  @Column('jsonb', { nullable: true })
  travelDate: { availableDates: string[] };
}
