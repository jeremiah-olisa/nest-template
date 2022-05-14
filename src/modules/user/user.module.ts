import { MongooseRole } from './../role/role.module';
import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import User, { UserSchema } from './user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

export const MongooseUser = MongooseModule.forFeatureAsync([
  {
    name: User.name,
    useFactory: () => {
      const schema = UserSchema;

      schema.pre('save', async function (next) {
        // Only run this function if password was actually modified or is present
        if (!this.isModified('password') || !this.password) return next();

        // Hash the password with cost of 12
        this.password = await bcrypt.hash(this.password, 12);

        next();
      });

      schema.virtual('fullName').get(function () {
        return `${this.firstName} ${this.lastName}`;
      });

      schema.pre('save', function (next) {
        if (!this.isModified('password') || this.isNew || !this.password)
          return next();
        const passwordChangedAt: Date = new Date(Date.now() - 1000);
        this.passwordChangedAt = passwordChangedAt;
        next();
      });

      return schema;
    },
  },
]);

@Module({
  imports: [MongooseUser, MongooseRole],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
