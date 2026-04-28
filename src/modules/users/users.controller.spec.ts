import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import type { UpdateUserDTO } from './dto/updateUser.dto';

const mockUsersService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  deactivate: jest.fn(),
  delete: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /users', () => {
    it('should call usersService.findAll with pagination', async () => {
      const pagination = { page: 1, limit: 10 };
      const expected = {
        data: [],
        meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
      };
      mockUsersService.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(pagination);

      expect(result).toEqual(expected);
      expect(mockUsersService.findAll).toHaveBeenCalledWith(pagination);
    });
  });

  describe('GET /users/:id', () => {
    it('should call usersService.findById with id', async () => {
      const id = 'uuid-1';
      const expected = {
        id,
        name: 'John',
        email: 'john@test.com',
        role: 'CLIENT',
        isActive: true,
      };
      mockUsersService.findById.mockResolvedValue(expected);

      const result = await controller.findById(id);

      expect(result).toEqual(expected);
      expect(mockUsersService.findById).toHaveBeenCalledWith(id);
    });
  });

  describe('POST /users', () => {
    it('should call usersService.create with dto', async () => {
      const dto = { name: 'John', email: 'john@test.com', password: '123456' };
      const expected = {
        id: 'uuid-1',
        name: dto.name,
        email: dto.email,
        role: 'CLIENT',
        isActive: true,
      };
      mockUsersService.create.mockResolvedValue(expected);

      const result = await controller.create(dto);

      expect(result).toEqual(expected);
      expect(mockUsersService.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('PUT /users/:id', () => {
    it('should call usersService.update with id and dto', async () => {
      const id = 'uuid-1';
      const dto: UpdateUserDTO = { id, name: 'Jane' };
      const expected = {
        id,
        name: 'Jane',
        email: 'john@test.com',
        role: 'CLIENT',
        isActive: true,
      };
      mockUsersService.update.mockResolvedValue(expected);

      const result = await controller.update(id, dto);

      expect(result).toEqual(expected);
      expect(mockUsersService.update).toHaveBeenCalledWith(id, dto);
    });
  });

  describe('PATCH /users/me', () => {
    it('should call usersService.update with current user id and dto', async () => {
      const currentUser: UpdateUserDTO = { id: 'uuid-1' };
      const dto: UpdateUserDTO = { id: 'uuid-1', name: 'Jane' };
      const expected = {
        id: 'uuid-1',
        name: 'Jane',
        email: 'john@test.com',
        role: 'CLIENT',
        isActive: true,
      };
      mockUsersService.update.mockResolvedValue(expected);

      const result = await controller.updateProfile(currentUser, dto);

      expect(result).toEqual(expected);
      expect(mockUsersService.update).toHaveBeenCalledWith(currentUser.id, dto);
    });
  });

  describe('PATCH /users/deactivate/:id', () => {
    it('should call usersService.deactivate with id and current user id', async () => {
      const id = 'uuid-2';
      const currentUser: UpdateUserDTO = { id: 'uuid-1' };
      const expected = {
        id,
        name: 'Jane',
        email: 'jane@test.com',
        role: 'CLIENT',
        isActive: false,
      };
      mockUsersService.deactivate.mockResolvedValue(expected);

      const result = await controller.deactivate(id, currentUser);

      expect(result).toEqual(expected);
      expect(mockUsersService.deactivate).toHaveBeenCalledWith(
        id,
        currentUser.id,
      );
    });
  });

  describe('DELETE /users/:id', () => {
    it('should call usersService.delete with id and current user id', async () => {
      const id = 'uuid-2';
      const currentUser: UpdateUserDTO = { id: 'uuid-1' };
      const expected = { id };
      mockUsersService.delete.mockResolvedValue(expected);

      const result = await controller.delete(id, currentUser);

      expect(result).toEqual(expected);
      expect(mockUsersService.delete).toHaveBeenCalledWith(id, currentUser.id);
    });
  });
});
