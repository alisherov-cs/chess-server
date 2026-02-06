import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async findGame(id: string) {
    const game = await this.prisma.game.findUnique({
      where: { id },
      include: {
        playerWhite: { omit: { password: true } },
        playerBlack: { omit: { password: true } },
        winner: true,
      },
    });

    if (!game) throw new NotFoundException('game not found');

    return game;
  }

  @OnEvent('newMove')
  async updateBoard(
    userId: string,
    gameId: string,
    currentPosition: string[],
    history: string[],
  ) {
    const game = await this.prisma.game.findUnique({ where: { id: gameId } });

    if (!game) throw new NotFoundException('game not found!');
    if (game.playerWhiteId !== userId && game.playerBlackId !== userId)
      throw new BadRequestException('no permission');
    if (game.playerWhiteId === userId && game.history.length % 2 === 1)
      throw new BadRequestException('not your move');
    if (game.playerBlackId === userId && game.history.length % 2 === 0)
      throw new BadRequestException('not your move');

    const updatedGame = await this.prisma.game.update({
      where: { id: gameId },
      data: { currentPosition, history },
    });

    return updatedGame;
  }
}
