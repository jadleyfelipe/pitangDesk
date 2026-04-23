import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
import * as sendgridHelper from '../../common/helpers/sendgridHelper';

jest.mock('../../common/helpers/sendgridHelper', () => ({
  __esModule: true,
  default: jest.fn().mockResolvedValue(undefined),
}));

const mockSendEmail = sendgridHelper.default as jest.MockedFunction<
  typeof sendgridHelper.default
>;

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      JWT_SECRET: 'test-secret',
      JWT_REFRESH_SECRET: 'test-refresh-secret',
      JWT_EXPIRATION: '15m',
      JWT_REFRESH_EXPIRATION: '7d',
    };
    return config[key];
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const dto = { name: 'John', email: 'john@test.com', password: '123456' };
    const createdUser = {
      id: 'uuid-1',
      email: dto.email,
      name: dto.name,
      role: 'CLIENT',
    };

    it('should register a new user and return tokens', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.register(dto);

      expect(result.user).toEqual(createdUser);
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          email: dto.email,
          passwordHash: 'hashed-password',
        },
        select: { id: true, email: true, name: true, role: true },
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(createdUser);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const dto = { email: 'john@test.com', password: '123456' };
    const user = {
      id: 'uuid-1',
      email: dto.email,
      name: 'John',
      passwordHash: 'hashed-password',
      role: 'CLIENT',
    };

    it('should login and return user with tokens', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.signAsync
        .mockResolvedValueOnce('access-token')
        .mockResolvedValueOnce('refresh-token');
      mockPrismaService.refreshToken.create.mockResolvedValue({});

      const result = await service.login(dto);

      expect(result.user).toEqual({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      });
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    const dto = { email: 'john@test.com' };

    it('should generate a 6-digit token and send email', async () => {
      const user = { id: 'uuid-1', email: dto.email };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.forgotPassword(dto);

      expect(result.message).toBe('Código enviado para o email.');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          resetPasswordToken: expect.stringMatching(/^\d{6}$/) as string,
          resetPasswordExp: expect.any(Date) as Date,
        },
      });
      expect(mockSendEmail).toHaveBeenCalledWith(
        user.email,
        'Password Reset',
        expect.stringContaining('Your password reset code is:'),
        expect.stringContaining('Your password reset code is:'),
      );
    });

    it('should return generic message if email does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword(dto);

      expect(result.message).toBe('Email não encontrado');
      expect(mockPrismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const dto = {
      email: 'john@test.com',
      token: '123456',
      password: 'newpassword',
    };

    it('should reset password with valid token', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);
      const user = {
        id: 'uuid-1',
        email: dto.email,
        resetPasswordToken: '123456',
        resetPasswordExp: futureDate,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hashed-password');
      mockPrismaService.user.update.mockResolvedValue({});

      const result = await service.resetPassword(dto);

      expect(result.message).toBe('Password reset successful');
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: user.id },
        data: {
          passwordHash: 'new-hashed-password',
          resetPasswordToken: null,
          resetPasswordExp: null,
        },
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.resetPassword(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is wrong', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);
      const user = {
        id: 'uuid-1',
        email: dto.email,
        resetPasswordToken: '654321',
        resetPasswordExp: futureDate,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      await expect(service.resetPassword(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if token is expired', async () => {
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - 1);
      const user = {
        id: 'uuid-1',
        email: dto.email,
        resetPasswordToken: '123456',
        resetPasswordExp: pastDate,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      await expect(service.resetPassword(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user has no pending reset', async () => {
      const user = {
        id: 'uuid-1',
        email: dto.email,
        resetPasswordToken: null,
        resetPasswordExp: null,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(user);

      await expect(service.resetPassword(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
