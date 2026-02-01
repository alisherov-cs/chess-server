import { IsString } from 'class-validator';

export class GoogleLoginDto {
  @IsString()
  access_token: string;

  @IsString()
  country: string;
}

export class GoogleUserDto {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}
