import 'reflect-metadata';
import { registerAs } from '@nestjs/config';
import {
  DB_HOST,
  DB_NAME,
  DB_PASSWORD,
  DB_PORT,
  DB_USERNAME,
} from './env.config';
import { DataSource, DataSourceOptions } from 'typeorm';

const config = {
  type: 'postgres',
  host: DB_HOST,
  port: Number(DB_PORT),
  username: DB_USERNAME,
  password: String(DB_PASSWORD),
  database: DB_NAME,
  entities: ['dist/**/*.entity{.ts,.js}'],
  autoLoadEntities: true,
  migrations: ['dist/migrations/*{.ts,.js}'],
  logging: false,
  dropSchema: false,
  synchronize: true,
  ssl:{
    rejectUnauthorized: false,
  },
};
export const typeOrmConfig = registerAs('typeorm', () => config);
export const connectionSource = new DataSource(config as DataSourceOptions);