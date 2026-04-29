import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('POST /auth/register', () => {
    it('should call authService.register with dto', async () => {
      const dto = { name: 'John', email: 'john@test.com', password: '123456' };
      const expected = {
        user: {
          id: 'uuid-1',
          email: dto.email,
          name: dto.name,
          role: 'CLIENT',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      mockAuthService.register.mockResolvedValue(expected);

      const result = await controller.register(dto);

      expect(result).toEqual(expected);
      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('POST /auth/login', () => {
    it('should call authService.login with dto', async () => {
      const dto = { email: 'john@test.com', password: '123456' };
      const expected = {
        user: { id: 'uuid-1', email: dto.email, name: 'John', role: 'CLIENT' },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      mockAuthService.login.mockResolvedValue(expected);

      const result = await controller.login(dto);

      expect(result).toEqual(expected);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should call authService.forgotPassword with dto', async () => {
      const dto = { email: 'john@test.com' };
      const expected = { message: 'Código enviado para o email.' };
      mockAuthService.forgotPassword.mockResolvedValue(expected);

      const result = await controller.forgotPassword(dto);

      expect(result).toEqual(expected);
      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(dto);
    });
  });

  describe('POST /auth/reset-password', () => {
    it('should call authService.resetPassword with dto', async () => {
      const dto = {
        email: 'john@test.com',
        token: '123456',
        password: 'newpassword',
      };
      const expected = { message: 'Password reset successful' };
      mockAuthService.resetPassword.mockResolvedValue(expected);

      const result = await controller.resetPassword(dto);

      expect(result).toEqual(expected);
      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto);
    });
  });
});
