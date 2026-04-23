import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino/LoggerModule';
import { AppController } from './app.controller';
import { envSchema } from './config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { JwtStrategy } from './common/strategies/jwt.strategy';
import { UsersModule } from './modules/users/users.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => envSchema.parse(config),
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minuto
        limit: 60, // 60 requests por minuto
      },
    ]),
    // Logger estruturado (Pino)
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        autoLogging: true, // Loga requests automaticamente
        redact: ['req.headers.authorization'], // Nunca loga tokens
      },
    }),
    ConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [
    JwtStrategy,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
