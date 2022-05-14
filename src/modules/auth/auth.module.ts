import { EmailService } from './../email/email.service';
import { UserService } from './../user/user.service';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
// import File, { FileSchema } from '../aws/file.schema';

import { MongooseRole } from './../role/role.module';
// import CloudStorage, { CloudStorageSchema } from '../aws/aws.schema';
import { MongooseUser } from '../user/user.module';

@Module({
  imports: [
    MongooseUser,
    // MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
    MongooseRole,
    // MongooseModule.forFeature([
    //   { name: CloudStorage.name, schema: CloudStorageSchema },
    // ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN') },
      }),
    }),
    // UserService,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, EmailService],
  // exports: [MongooseUser]
})
export class AuthModule {}
