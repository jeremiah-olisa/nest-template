import { randomString } from './../../utils/index';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response as HttpResponse } from 'express';
import factory from './../../database/factory';
import response from './../../utils/response-handler';
import User from './user.schema';
import Role from '../role/database/role.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role as RoleEnum } from '../role/database/role.enum';
import { CollectionId } from './../../common/types';

export const flattenRole = (objArr: any[]) => {
  let arr = [];

  objArr.forEach((object) => {
    arr.push(object?.name || object);
  });
  return arr;
};

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly model: Model<User>,
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  async create(dto: CreateUserDto, res: HttpResponse) {
    let data = await factory.createOne(this.model, dto);
    let httpRes = response.success(data, {
      message: 'User created successfully',
    });
    return response.send(httpRes, res, 'create');
  }

  async findAll(res: HttpResponse) {
    let data = await factory.getAll(this.model, undefined, undefined, {
      password: 0,
    });
    let httpRes = response.success(data, {
      results: data?.length,
      message: 'Users retrived successfully',
    });
    return response.send(httpRes, res, 'read');
  }

  async getUser(id: string) {
    return await factory.getOne(
      this.model,
      id,
      { path: 'roles' },
      { password: 0 },
    );
  }

  async getUserRoles(id: string) {
    let user = await this.getUser(id);
    let dataObj = await this.roleModel
      .find({ _id: { $in: user.roles } })
      .select('name -_id');

    return flattenRole(dataObj);
  }

  // async getUserAddresses(user: string) {
  //   let dataObj = await this.addressModel.find({ user });

  //   return dataObj;
  // }

  // async getUserAddress(user: string) {
  //   let dataObj = await this.addressModel.findOne({ user, defaultAddress: { $ne: false } });

  //   return dataObj;
  // }

  async addUserToRole(_user: User & { _id: any }, _role: RoleEnum) {
    try {
      // 2) Check if user exists && password is correct
      const role = await this.roleModel.findOne({ name: _role });
      if (!role)
        throw new HttpException(
          `No role was found with the name: ${_role}`,
          HttpStatus.NOT_FOUND,
        );

      // const user = await this.model.findOne({ _id: _user._id });
      // if (!user) throw new HttpException(`No user was found with id: ${_user._id}`, HttpStatus.NOT_FOUND);
      if (_user?.roles?.includes(role?._id)) return _user;

      _user.roles.push(role?._id);

      return await _user.save();
    } catch (err) {
      throw new HttpException(err, HttpStatus.BAD_REQUEST);
    }
  }

  // async addUserAddress(_user: User & { _id: any }, _addressId: string) {
  //   try {
  //     // 2) Check if user exists && password is correct
  //     const address = await this.addressModel.findOne({ _id: _addressId });
  //     if (!address) throw new HttpException(`No role was found with the name: ${_addressId}`, HttpStatus.NOT_FOUND);

  //     // const user = await this.model.findOne({ _id: _user._id });
  //     // if (!user) throw new HttpException(`No user was found with id: ${_user._id}`, HttpStatus.NOT_FOUND);

  //     if ((_user?.address as any).includes(_addressId)) return _user;

  //     (_user.address as any).push(_addressId);

  //     return await _user.save();
  //   } catch (err) {
  //     throw new HttpException(err, HttpStatus.BAD_REQUEST);
  //   }
  // }

  async findOne(id: string, res: HttpResponse) {
    let data = await this.getUser(id);
    // let rolesObj = await this.roleModel.find({ _id: { $in: data.roles } })

    data.roles = await this.roleModel.find({ _id: { $in: data.roles } });
    // console.log(rolesObj)

    let httpRes = response.success(data, {
      message: 'User retrived successfully',
    });
    return response.send(httpRes, res, 'read');
  }

  async update(id: string, dto: UpdateUserDto, res: HttpResponse) {
    let data = await factory.updateOne(this.model, id, dto);
    let httpRes = response.success(data, {
      message: 'User updated successfully',
    });
    return response.send(httpRes, res, 'update');
  }

  async remove(id: string, res: HttpResponse) {
    let data = await factory.deleteOne(this.model, id);
    let httpRes = response.success(data, {
      message: 'User deleted successfully',
    });
    return response.send(httpRes, res, 'delete');
  }
}
