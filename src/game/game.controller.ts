import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findGame(@Param('id') id: string) {
    return await this.gameService.findGame(id);
  }
}
