import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { GoogleLoginDto } from './dto/google.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserPayloadDto } from './dto/payload.dto';
import {
  CheckEmailDto,
  LoginDto,
  PasswordSetupDto,
  SignupDto,
  UsernameSetupDto,
} from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google')
  async googleLogin(@Body() googleLoginDto: GoogleLoginDto) {
    return await this.authService.googleLogin(googleLoginDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  @Post('signup')
  async signup(@Body() signupDto: SignupDto) {
    return await this.authService.signup(signupDto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@Request() req: { user: UserPayloadDto }) {
    return await this.authService.profile(req.user);
  }

  @Post('profile/setup/username')
  @UseGuards(JwtAuthGuard)
  async profileUsernameSetup(
    @Request() req: { user: UserPayloadDto },
    @Body() { username }: UsernameSetupDto,
  ) {
    return this.authService.profileUsernameSetup(req.user, username);
  }

  @Post('profile/setup/password')
  @UseGuards(JwtAuthGuard)
  async profilePasswordSetup(
    @Request() req: { user: UserPayloadDto },
    @Body() { password }: PasswordSetupDto,
  ) {
    return this.authService.profilePasswordSetup(req.user, password);
  }

  @Post('username/check')
  @UseGuards(JwtAuthGuard)
  async checkUsername(
    @Request() req: { user: UserPayloadDto },
    @Body() { username }: UsernameSetupDto,
  ) {
    return this.authService.checkUsernameExist(req.user, username);
  }

  @Post('email/check')
  async checkEmail(@Body() { email }: CheckEmailDto) {
    return this.authService.checkEmailExist(email);
  }
}
