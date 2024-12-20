import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ThrottlerModuleOptions,
  ThrottlerOptions,
  ThrottlerOptionsFactory,
} from '@nestjs/throttler';
import { RedisOptions } from 'ioredis';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';

@Injectable()
export class ThrottlerConfig implements ThrottlerOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createThrottlerOptions(): ThrottlerModuleOptions {
    return this.configService.get<boolean>('testing')
      ? this.configService.get<ThrottlerModuleOptions>('throttler')
      : {
          throttlers: this.configService.get<ThrottlerModuleOptions>(
            'throttler',
          ) as ThrottlerOptions[],
          storage: new ThrottlerStorageRedisService(
            this.configService.get<RedisOptions>('redis'),
          ),
        };
  }
}
