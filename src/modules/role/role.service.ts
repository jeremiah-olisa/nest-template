import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Response as HttpResponse } from 'express';
import factory from '../../database/factory';
import { InjectModel } from '@nestjs/mongoose';
import Role from './database/role.schema';
import { Model } from 'mongoose';
import response from '../../utils/response-handler';
@Injectable()
export class RoleService {
  constructor(@InjectModel(Role.name) private readonly model: Model<Role>) {}

  async create(dto: CreateRoleDto, res: HttpResponse) {
    let data = await factory.createOne(this.model, dto);
    let httpRes = response.success(data, {
      message: 'role created successfully',
    });
    return response.send(httpRes, res, 'create');
  }

  async findAll(res: HttpResponse) {
    let data = await factory.getAll(this.model);
    let httpRes = response.success(data, {
      results: data?.length,
      message: 'roles retrived successfully',
    });
    return response.send(httpRes, res, 'read');
  }

  async findRoles(ids: string[]) {
    return await this.model.find({ _id: { $in: ids } });
  }

  async findOne(id: string, res: HttpResponse) {
    let data = await factory.getOne(this.model, id);
    let httpRes = response.success(data, {
      message: 'role retrieved successfully',
    });
    return response.send(httpRes, res, 'read');
  }

  async update(id: string, dto: UpdateRoleDto, res: HttpResponse) {
    let data = await factory.updateOne(this.model, id, dto);
    let httpRes = response.success(data, {
      message: 'role updated successfully',
    });
    return response.send(httpRes, res, 'update');
  }

  async remove(id: string, res: HttpResponse) {
    let data = await factory.deleteOne(this.model, id);
    let httpRes = response.success(data, {
      message: 'role deleted successfully',
    });
    return response.send(httpRes, res, 'delete');
  }
}
