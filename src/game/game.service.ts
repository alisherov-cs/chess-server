import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';

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
}
