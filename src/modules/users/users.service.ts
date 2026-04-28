import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDTO } from './dto/createUser.dto';
import { UpdateUserDTO } from './dto/updateUser.dto';
import * as bcrypt from 'bcrypt';
import { PaginationDTO } from './dto/pagination.dto';

const USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(pagination: PaginationDTO) {
    const { page = 1, limit = 100 } = pagination ?? {};
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        select: USER_SELECT,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    return user;
  }

  async create(dto: CreateUserDTO) {
    const validUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (validUser) throw new ConflictException('Email já cadastrado');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role ?? 'CLIENT',
      },
      select: USER_SELECT,
    });
  }

  async update(id: string, dto: UpdateUserDTO) {
    const validUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!validUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (validUser.email === dto.email) {
      throw new BadRequestException('Email já cadastrado');
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : undefined;

    return this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
      },
      select: USER_SELECT,
    });
  }

  async deactivate(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ForbiddenException('Não é possível desativar a si mesmo');
    }

    const validUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!validUser) {
      throw new BadRequestException('Usuário não encontrado');
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: USER_SELECT,
    });
  }

  async delete(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ForbiddenException('Não é possível desativar a si mesmo');
    }
    const validUser = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!validUser) {
      throw new BadRequestException('Usuário não encontrado');
    }

    return this.prisma.user.delete({
      where: {
        id,
      },
      select: USER_SELECT,
    });
  }
}
