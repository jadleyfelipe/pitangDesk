import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { registerSchema } from './dto/register.dto';
import type { RegisterDTO } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginSchema } from './dto/login.dto';
import type { LoginDTO } from './dto/login.dto';
import { ForgotSchema } from './dto/forgot.dto';
import type { ForgotDTO } from './dto/forgot.dto';
import { ResetSchema } from './dto/reset.dto';
import type { ResetDTO } from './dto/reset.dto';
import { Public } from '../../common/decorators/is-public.decorator';
import { Throttle } from '@nestjs/throttler';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @Post('register')
  async register(
    @Body(new ZodValidationPipe(registerSchema)) dto: RegisterDTO,
  ) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body(new ZodValidationPipe(LoginSchema)) dto: LoginDTO) {
    return this.authService.login(dto);
  }

  @Public()
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @Post('forgot-password')
  async forgotPassword(
    @Body(new ZodValidationPipe(ForgotSchema)) dto: ForgotDTO,
  ) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body(new ZodValidationPipe(ResetSchema)) dto: ResetDTO) {
    return this.authService.resetPassword(dto);
  }
}
