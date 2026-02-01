import axios from 'axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { GoogleLoginDto, GoogleUserDto } from './dto/google.dto';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, SignupDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { UserPayloadDto } from './dto/payload.dto';
import { nanoid } from 'nanoid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser({ usernameOrEmail, password }: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
      },
    });

    if (
      user &&
      user.password &&
      (await bcrypt.compare(password, user.password))
    ) {
      const { password: _, ...rest } = user;
      return rest;
    }

    return null;
  }

  async login({ usernameOrEmail, password }: LoginDto) {
    const user = await this.validateUser({ usernameOrEmail, password });

    if (!user) throw new BadRequestException('Wrong login or password');

    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET_KEY,
      }),
    };
  }

  async signup({ email, password, country }: SignupDto) {
    const exist = await this.prisma.user.findUnique({ where: { email } });

    if (exist) throw new BadRequestException('email already taken!');

    const uniqueKey = nanoid(6);
    const user = await this.prisma.user.create({
      data: {
        email,
        username: `New_user_${uniqueKey}`,
        password: await bcrypt.hash(password, 12),
        country,
      },
    });

    const payload = {
      sub: user.id,
      email: user.email,
    };

    return {
      access_token: await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_SECRET_KEY,
      }),
    };
  }

  async googleLogin({ access_token, country }: GoogleLoginDto) {
    try {
      const res = await axios.get<GoogleUserDto>(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      let user = await this.prisma.user.findUnique({
        where: { email: res.data.email },
      });

      if (!user) {
        const uniqueKey = nanoid(6);
        user = await this.prisma.user.create({
          data: {
            email: res.data.email,
            username: `${res.data.given_name}_${uniqueKey}`,
            avatar: res.data.picture,
            country,
            googleId: res.data.sub,
          },
        });

        const payload = {
          sub: user.id,
          email: user.email,
        };

        return {
          access_token: await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_SECRET_KEY,
          }),
          initial: true,
        };
      }

      const payload = {
        sub: user.id,
        email: user.email,
      };

      return {
        access_token: await this.jwtService.signAsync(payload, {
          secret: process.env.JWT_SECRET_KEY,
        }),
        initial: false,
      };
    } catch (err) {
      console.log(err);
    }
  }

  async profile({ userId }: UserPayloadDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) throw new NotFoundException('profile not found');

    const { password: _, ...rest } = user;

    return rest;
  }

  async checkUsernameExist({ userId }: UserPayloadDto, username: string) {
    const exist = await this.prisma.user.findUnique({ where: { username } });

    return !(!!exist?.id && exist.id !== userId);
  }

  async checkEmailExist(email: string) {
    const exist = await this.prisma.user.findUnique({ where: { email } });

    return !exist?.id;
  }

  async profileUsernameSetup({ userId }: UserPayloadDto, username: string) {
    const exist = await this.prisma.user.findUnique({ where: { username } });

    if (exist) throw new BadRequestException('username already exist!');

    return await this.prisma.user.update({
      where: { id: userId },
      data: { username },
    });
  }

  async profilePasswordSetup({ userId }: UserPayloadDto, password: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: await bcrypt.hash(password, 12),
      },
    });
  }
}
