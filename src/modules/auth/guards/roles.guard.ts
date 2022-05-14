// import { UserService } from "./../../app/user/user.service";
// import { RoleService } from "./../../app/role/role.service";
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';
// import Role from './../../database/schemas/role.schema';

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role as RoleEnum } from '../../role/database/role.enum';

import { ROLES_KEY } from '../decorators/role.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector, // private readonly userService: UserService, // private readonly roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<RoleEnum[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // console.log(user, requiredRoles);

    if (requiredRoles?.some((role) => user?.roles?.includes(role))) {
      return true;
    } else {
      throw new UnauthorizedException(
        'You do not have permission to access this resource',
      );
    }
  }
}
