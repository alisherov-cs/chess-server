import { PlayAs } from '@prisma/client';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';

export class ChellangeDto {
  @IsString()
  friendId: string;

  @IsBoolean()
  rated: boolean;

  @IsNumber()
  duration: number;

  @IsString()
  timeId: string;

  @IsEnum(PlayAs)
  playAs: PlayAs;
}
