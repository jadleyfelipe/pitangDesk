import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import type { RegisterDTO } from './dto/register.dto';
import { AuthService } from './auth.service';
import type { LoginDTO } from './dto/login.dto';
import type { ForgotDTO } from './dto/forgot.dto';
import type { ResetDTO } from './dto/reset.dto';
import { Public } from '../../common/decorators/is-public.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('register')
  async register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
  }

  @Public()
  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotDTO) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetDTO) {
    return this.authService.resetPassword(dto);
  }
}
