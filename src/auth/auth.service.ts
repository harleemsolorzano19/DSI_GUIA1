import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  async validateUser(user: LoginDto) {
    const foundUser = await this.prisma.user.findUnique({
      where: {
        email: user.email,
      },
    });

    if (!foundUser) return null;

    const isPasswordValid = await bcrypt.compare(
      user.password,
      foundUser.password,
    );

    if (isPasswordValid) {
      // 1. Firmamos el JWT
      const token = this.jwtService.sign({
        id: foundUser.id,
        email: foundUser.email,
        role: foundUser.role,
      });

      // 2. Extraemos la contraseña para no devolverla en la respuesta HTTP
      const { password, ...userWithoutPassword } = foundUser;

      // 3. Retornamos el objeto completo con el token y los datos de la base de datos
      return {
        access_token: token,
        user: userWithoutPassword,
      };
    } else {
      throw new UnauthorizedException('Credenciales inválidas');
    }
  }
}