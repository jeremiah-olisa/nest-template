import { CollectionId } from '../../common/types/index';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import Role from '../role/database/role.schema';
import { Exclude, Transform, Type } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import modelOptions from '../../common/model-options';
// import CloudStorage, { CloudStorageSchema } from '../aws/aws.schema';

@Schema(modelOptions)
export default class User extends Document {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: false, unique: false })
  phone: string;

  @Prop()
  gender: string;

  // #region decorators
  @Exclude()
  @Prop()
  // #endregion decorators
  password: string;

  // #region decorators
  @Exclude()
  @Prop()
  // #endregion decorators
  passwordChangedAt?: Date;

  // #region decorators
  @Exclude()
  @Prop()
  // #endregion decorators
  passwordResetToken?: string;

  // #region decorators
  @Exclude()
  @Prop({ type: Date })
  // #endregion decorators
  passwordResetExpires?: Date | number;

  @Prop({ default: false })
  mailConfirmed: boolean;

  @Prop({ default: true })
  active: boolean;

  // #region decorators
  // @Prop({ type: CloudStorageSchema, required: false })
  // @Type(() => CloudStorage)
  // // #endregion decorators
  // profilePicture?: CloudStorage;

  @Prop([{ type: CollectionId, required: false, ref: Role.name }])
  @Type(() => Role)
  @Transform(() => Role)
  roles: Role[];

  correctPassword: Function;
  changedPasswordAfter: Function;
  createPasswordResetToken: Function;
  includeRoles: Function;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  // console.log(JWTTimestamp);

  if (this.passwordChangedAt) {
    const timestamp: string = (
      this.passwordChangedAt?.getTime() / 1000
    ).toString();
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(timestamp, 10);

      return JWTTimestamp < changedTimestamp;
    }
  }

  // False means NOT changed
  return false;
};

UserSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

UserSchema.methods.includeRoles = function () {
  // const userRoles = RoleSchema.query({ _id: this.roles })
};
