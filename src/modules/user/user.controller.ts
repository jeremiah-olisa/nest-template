import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response as HttpResponse } from 'express';

@ApiBearerAuth()
@Controller('users')
@ApiTags('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() dto: CreateUserDto, @Res() res: HttpResponse) {
    return await this.userService.create(dto, res);
  }

  @Get()
  async findAll(@Res() res: HttpResponse) {
    return await this.userService.findAll(res);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: HttpResponse) {
    return await this.userService.findOne(id, res);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Res() res: HttpResponse,
  ) {
    return await this.userService.update(id, dto, res);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res: HttpResponse) {
    return await this.userService.remove(id, res);
  }
}
