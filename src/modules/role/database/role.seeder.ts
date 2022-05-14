import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Role from './role.schema';
import { Seeder, DataFactory } from 'nestjs-seeder';
import { Roles } from './role.enum';

export type RoleSeedObject = {
  name: string;
};

@Injectable()
export class RoleSeeder implements Seeder {
  constructor(@InjectModel(Role.name) private readonly model: Model<Role>) {}

  async seedNew(): Promise<(Role & { _id: any })[]> {
    // Generate 10 users.
    const models = DataFactory.createForClass(Role).generate(10);

    // Insert into the database.
    return this.model.insertMany(models);
  }

  async seed(): Promise<(Role & { _id: any })[]> {
    // Generate 10 models.
    const models: RoleSeedObject[] = [];

    for await (const role of Roles) {
      let exists = await this.model.exists({ name: role });
      if (exists == null || !exists) models.push({ name: role });
    }
    models.length > 1 && console.table(models);
    return await this.model.insertMany(models);
  }

  async drop() {
    return this.model.deleteMany({});
  }
}
