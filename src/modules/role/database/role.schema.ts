import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as slugify from 'slugify';
import { Factory } from 'nestjs-seeder';
import modelOptions from '../../../common/model-options';

@Schema(modelOptions)
export default class Role extends Document {
  @Factory((faker, ctx) => faker.name.findName())
  @Prop({ required: true, unique: true })
  name: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// RoleSchema.pre("save", function (next) {
//   this.slug = slugify.default(this.name);
//   next();
// });
