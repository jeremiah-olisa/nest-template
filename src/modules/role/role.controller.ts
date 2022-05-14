import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { Response as HttpResponse } from 'express';
import slugify from 'slugify';
import { Roles } from '../auth/decorators/role.decorator';
import { Role } from './database/role.enum';

@ApiBearerAuth()
@Controller('roles')
@ApiTags('roles')
@Roles(Role.Admin)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  async create(@Body() dto: CreateRoleDto, @Res() res: HttpResponse) {
    return await this.roleService.create(
      { ...dto, slug: slugify(dto.name) },
      res,
    );
  }

  @Get()
  async findAll(@Res() res: HttpResponse) {
    // console.log("Finding all.....");
    return await this.roleService.findAll(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: HttpResponse) {
    return await this.roleService.findOne(id, res);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @Res() res: HttpResponse,
  ) {
    return await this.roleService.update(
      id,
      { ...dto, slug: slugify(dto.name) },
      res,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: HttpResponse) {
    return await this.roleService.remove(id, res);
  }
}
