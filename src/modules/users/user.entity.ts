import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrderEntity } from '../orders/order.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({
    select: false,
  })
  password: string;

  @Column()
  dni: number;

  @Column()
  phone: number;

  @Column()
  lastName: string;

  @Column({
    default: true,
  })
  isActive: boolean;

  @Column({
    default: false,
  })
  IsAdmin: boolean;

  @OneToMany(() => OrderEntity, (order) => order.user)
  order?: OrderEntity[];
}
