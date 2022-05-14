import { Module } from '@nestjs/common';
import { RoleService } from './role.service';
import { RoleController } from './role.controller';
import Role, { RoleSchema } from './database/role.schema';
import { MongooseModule } from '@nestjs/mongoose';
import slugify from 'slugify';

export const MongooseRole = MongooseModule.forFeatureAsync([
  {
    name: Role.name,
    useFactory: () => {
      const schema = RoleSchema;

      schema.virtual('slug').get(function () {
        return slugify(this.name);
      });

      return schema;
    },
  },
]);

@Module({
  imports: [MongooseRole],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
