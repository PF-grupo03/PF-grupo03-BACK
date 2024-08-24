import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProductEntity } from '../products/product.entity';


@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  isActive: boolean;

  @ManyToMany(() => ProductEntity, (product) => product.categories)
  products: ProductEntity[];

}
