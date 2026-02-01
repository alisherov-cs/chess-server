import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  usernameOrEmail: string;

  @IsString()
  password: string;
}

export class SignupDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  country: string;
}

export class UsernameSetupDto {
  @IsString()
  username: string;
}

export class PasswordSetupDto {
  @IsString()
  password: string;
}

export class CheckEmailDto {
  @IsString()
  email: string;
}
