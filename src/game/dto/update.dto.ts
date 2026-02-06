import { IsArray, IsString } from 'class-validator';

export class UpdateBoardDto {
  @IsArray()
  currentPosition: string[];

  @IsArray()
  history: string[];
}

export class PlayerMovedDto {
  @IsArray()
  currentPosition: string[];

  @IsArray()
  history: string[];

  @IsString()
  gameId: string;

  @IsString()
  userId: string;
}
