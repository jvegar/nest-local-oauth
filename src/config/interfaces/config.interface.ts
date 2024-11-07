import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { IEmailConfig } from './email-config.interface';
import { IJwt } from './jwt.interface';
import { ThrottlerModuleOptions } from '@nestjs/throttler';
import { RedisOptions } from 'ioredis';

export interface IConfig {
  id: string;
  port: number;
  domain: string;
  corsOrigins: string[];
  db: MikroOrmModuleOptions;
  jwt: IJwt;
  emailService: IEmailConfig;
  throttler: ThrottlerModuleOptions;
  testing: boolean;
  redis: RedisOptions;
  health: {
    memoryHeapLimit: number;
    storageThreshold: number;
  };
}
