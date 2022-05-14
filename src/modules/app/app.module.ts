import { FacebookStrategy } from '../auth/strategies/facebook.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { RoleModule } from '../role/role.module';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from './../auth/guards/roles.guard';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { GoogleStrategy } from '../auth/strategies/google.strategy';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

const Limiter = ThrottlerModule.forRoot({
  ttl: 3600,
  limit: 10,
});

export const MongooseConnector = MongooseModule.forRootAsync({
  imports: [ConfigModule, Limiter],
  useFactory: async (configService: ConfigService) => ({
    uri: configService.get('DATABASE'),
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }),
  inject: [ConfigService],
});

export const DotEnv = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: ['.env.development', '.env.production'],
});

export const RoleGuard = {
  provide: APP_GUARD,
  useClass: RolesGuard,
};

export const JWTGuard = {
  provide: APP_GUARD,
  useClass: JwtGuard,
};

@Module({
  imports: [AuthModule, UserModule, RoleModule, DotEnv, MongooseConnector],
  controllers: [AppController],
  providers: [
    AppService,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
    JWTGuard,
    RoleGuard,
  ],
})
export class AppModule {}
