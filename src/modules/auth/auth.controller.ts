import { Controller, Post, Body } from '@nestjs/common';
import type { RegisterDTO } from './dto/register.dto';
import { AuthService } from './auth.service';
import type { LoginDTO } from './dto/login.dto';
import type { ForgotDTO } from './dto/forgot.dto';
import type { ResetDTO } from './dto/reset.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDTO) {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotDTO) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetDTO) {
    return this.authService.resetPassword(dto);
  }
}
