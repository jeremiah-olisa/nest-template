import { MongooseConnector } from './../modules/app/app.module';
import { seeder } from 'nestjs-seeder';
import { RoleSeeder } from '../modules/role/database/role.seeder';
import { MongooseRole } from './../modules/role/role.module';

seeder({
  imports: [MongooseConnector, MongooseRole],
}).run([RoleSeeder]);
