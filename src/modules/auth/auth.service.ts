import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { randomInt } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDTO } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDTO } from './dto/login.dto';
import sendEmail from '../../common/helpers/sendgridHelper';
import { ForgotDTO } from './dto/forgot.dto';
import { ResetDTO } from './dto/reset.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDTO) {
    const userExists = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
      },
      select: { id: true, email: true, name: true, role: true },
    });

    const tokens = await this.generateTokens(user);

    return { user, ...tokens };
  }

  async login(dto: LoginDTO) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      ...tokens,
    };
  }

  async forgotPassword(dto: ForgotDTO) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      return { message: 'Email não encontrado' };
    }

    const resetToken = (100000 + randomInt(900000)).toString();
    const resetExp = new Date();
    resetExp.setHours(resetExp.getHours() + 1);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExp: resetExp,
      },
    });

    await sendEmail(
      user.email,
      'Password Reset',
      `Your password reset code is: ${resetToken}`,
      `<p>Your password reset code is: <strong>${resetToken}</strong></p><p>This code expires in 1 hour.</p>`,
    );

    return { message: 'Código enviado para o email.' };
  }

  async resetPassword(dto: ResetDTO) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (user?.resetPasswordExp == null || user?.resetPasswordToken == null) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    if (
      !user ||
      user.resetPasswordToken !== dto.token ||
      user.resetPasswordExp < new Date()
    ) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExp: null,
      },
    });

    return { message: 'Password reset successful' };
  }

  private async generateTokens(user: {
    id: string;
    email: string;
    role: string;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_SECRET'),
        expiresIn: this.configService.get('JWT_EXPIRATION'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get('JWT_REFRESH_EXPIRATION'),
      }),
    ]);

    // Salvar refresh token no banco
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

    return { accessToken, refreshToken };
  }
}
