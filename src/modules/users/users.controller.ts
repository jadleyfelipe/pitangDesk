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
import { CreateUserSchema } from './dto/createUser.dto';
import type { CreateUserDTO } from './dto/createUser.dto';
import { UpdateUserSchema } from './dto/updateUser.dto';
import type { UpdateUserDTO } from './dto/updateUser.dto';
import { UpdateProfileSchema } from './dto/updateUser.dto';
import type { UpdateProfileDTO } from './dto/updateUser.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { paginationSchema } from './dto/pagination.dto';
import type { PaginationDTO } from './dto/pagination.dto';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser() user: { id: string }) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: { id: string },
    @Body(new ZodValidationPipe(UpdateProfileSchema)) dto: UpdateProfileDTO,
  ) {
    return this.usersService.update(user.id, dto);
  }

  @Get()
  @Roles(Role.ADMIN)
  async findAll(
    @Query(new ZodValidationPipe(paginationSchema)) pagination: PaginationDTO,
  ) {
    return await this.usersService.findAll(pagination);
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  async findById(@Param('id') id: string) {
    return await this.usersService.findById(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  async create(
    @Body(new ZodValidationPipe(CreateUserSchema)) data: CreateUserDTO,
  ) {
    return await this.usersService.create(data);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateUserSchema)) data: UpdateUserDTO,
  ) {
    return await this.usersService.update(id, data);
  }

  @Patch('deactivate/:id')
  @Roles(Role.ADMIN)
  async deactivate(
    @Param('id') id: string,
    @CurrentUser() user: { id: string },
  ) {
    return await this.usersService.deactivate(id, user.id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return await this.usersService.delete(id, user.id);
  }
}
