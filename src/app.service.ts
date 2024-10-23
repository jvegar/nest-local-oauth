import { MikroORM } from '@mikro-orm/core';
import {
  Injectable,
  Logger,
  LoggerService,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { initializeSchema } from './config/schema.init';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private readonly loggerService: LoggerService;
  private readonly testing: boolean;

  constructor(
    private readonly orm: MikroORM,
    private readonly configService: ConfigService,
  ) {
    this.loggerService = new Logger(AppService.name);
    this.testing = this.configService.get('testing');
  }

  public async onModuleInit() {
    if (this.testing) {
      await initializeSchema(this.orm);
    }
  }

  public async onModuleDestroy() {
    this.loggerService.log('Closing database connection');
    await this.orm.close();
    this.loggerService.log('Closed database connection');
  }
}
