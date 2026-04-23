import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import type { CreateUserDTO } from './dto/createUser.dto';
import type { UpdateUserDTO } from './dto/updateUser.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { PaginationDTO } from './dto/pagination.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: UpdateUserDTO) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: UpdateUserDTO,
    @Body() dto: UpdateUserDTO,
  ) {
    return this.usersService.update(user.id, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll(@Query() pagination: PaginationDTO) {
    return await this.usersService.findAll(pagination);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async findById(@Param('id') id: string) {
    return await this.usersService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() data: CreateUserDTO) {
    return await this.usersService.create(data);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(@Param('id') id: string, @Body() data: UpdateUserDTO) {
    return await this.usersService.update(id, data);
  }

  @Patch('deactivate/:id')
  @Roles(Role.ADMIN)
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() user: UpdateUserDTO,
  ) {
    return await this.usersService.deactivate(id, user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string, @CurrentUser() user: UpdateUserDTO) {
    return await this.usersService.delete(id, user.id);
  }
}
