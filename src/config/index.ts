import { LoadStrategy } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/postgresql';
import { readFileSync } from 'fs';
import { join } from 'path';
import { IConfig } from './interfaces/config.interface';
import { redisUrlParser } from './utils/redis-url-parser.util';

export function config(): IConfig {
  const publicKey = readFileSync(
    join(__dirname, '..', '..', 'keys/public.key'),
    'utf-8',
  );
  const privateKey = readFileSync(
    join(__dirname, '..', '..', 'keys/private.key'),
    'utf-8',
  );
  const testing = process.env.NODE_ENV !== 'production';
  return {
    id: process.env.APP_ID,
    port: parseInt(process.env.PORT, 10),
    domain: process.env.DOMAIN,
    corsOrigins: process.env.CORS_ORIGINS?.split(','),
    jwt: {
      access: {
        privateKey,
        publicKey,
        time: parseInt(process.env.JWT_ACCESS_TIME, 10),
      },
      confirmation: {
        secret: process.env.JWT_CONFIRMATION_SECRET,
        time: parseInt(process.env.JWT_CONFIRMATION_TIME, 10),
      },
      resetPassword: {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
        time: parseInt(process.env.JWT_RESET_PASSWORD_TIME, 10),
      },
      refresh: {
        secret: process.env.JWT_REFRESH_SECRET,
        time: parseInt(process.env.JWT_REFRESH_TIME, 10),
      },
      allowedDomains: process.env.ALLOWED_DOMAINS?.split(',') || [],
    },
    emailService: {
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT, 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    },
    db: defineConfig({
      clientUrl: process.env.DATABASE_URL,
      entities: ['dist/**/*/*.entity.js', 'dist/**/*/*.embeddable.js'],
      entitiesTs: ['src/**/*/*.entity.ts', 'src/**/*/*.embeddable.ts'],
      loadStrategy: LoadStrategy.JOINED,
      allowGlobalContext: true,
      driverOptions: {
        ...(process.env.NODE_ENV === 'production' && {
          connection: { ssl: { rejectUnauthorized: false } },
        }),
      },
    }),
    throttler: [
      {
        ttl: parseInt(process.env.THROTTLE_TTL, 10),
        limit: parseInt(process.env.THROTTLE_LIMIT, 10),
      },
    ],
    testing,
    redis: redisUrlParser(process.env.REDIS_URL),
    health: {
      memoryHeapLimit: parseInt(process.env.HEALTH_MEMORY_HEAP_LIMIT, 10),
      storageThreshold: parseFloat(process.env.HEALTH_STORAGE_THRESHOLD),
    },
  };
}
