import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { ChellangeDto } from './dto/chellange.dto';
import { UserPayloadDto } from 'src/auth/dto/payload.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { GameStatus, PlayAs, Status } from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class InvitationService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  async chellangeFriend(
    { userId }: UserPayloadDto,
    { friendId, duration, rated, playAs, timeId }: ChellangeDto,
  ) {
    let playerWhiteId = userId;
    let playerBlackId = friendId;

    if (playAs === PlayAs.white) {
      console.log('how???');
      playerWhiteId = userId;
      playerBlackId = friendId;
    } else if (playAs === PlayAs.black) {
      playerWhiteId = friendId;
      playerBlackId = userId;
    } else {
      console.log('had to work');
      const players = [userId, friendId];
      const randomWhitePlayer = [...players].sort(() => Math.random() - 0.5)[0];
      console.log(randomWhitePlayer);
      playerWhiteId = randomWhitePlayer;
      playerBlackId = randomWhitePlayer === userId ? friendId : userId;
    }

    const newGame = await this.prisma.game.create({
      data: {
        playerWhiteId,
        playerBlackId,
        duration,
        timeId,
        rated,
      },
    });

    const invitation = await this.prisma.invitation.create({
      data: {
        fromId: userId,
        toId: friendId,
        duration,
        rated,
        playAs,
        timeId,
        gameId: newGame.id,
      },
      include: { from: { omit: { password: true } } },
    });

    this.eventEmitter.emit('chellange.created', friendId, invitation);

    return newGame;
  }

  async acceptInvitation({ userId }: UserPayloadDto, id: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation) throw new NotFoundException('invitation not found');

    const game = await this.prisma.game.findUnique({
      where: { id: invitation.gameId },
    });

    if (!game) throw new NotFoundException('game not found');
    if (game.playerBlackId !== userId && game.playerWhiteId !== userId)
      throw new BadRequestException('has no permission');

    await this.prisma.invitation.update({
      where: { id },
      data: { status: Status.accepted },
    });
    await this.prisma.game.update({
      where: { id: invitation.gameId },
      data: { status: GameStatus.ongoing, startedAt: new Date() },
    });

    this.eventEmitter.emit(
      'chellange.accepted',
      game.playerWhiteId,
      game.playerBlackId,
      game.id,
    );

    return game;
  }

  async rejectInvitation({ userId }: UserPayloadDto, id: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id },
    });

    if (!invitation) throw new NotFoundException('invitation not found');

    const game = await this.prisma.game.findUnique({
      where: { id: invitation.gameId },
    });

    if (!game) throw new NotFoundException('game not found');
    if (game.playerBlackId !== userId && game.playerWhiteId !== userId)
      throw new BadRequestException('has no permission');

    await this.prisma.invitation.update({
      where: { id },
      data: { status: Status.rejected },
    });
    await this.prisma.game.update({
      where: { id: invitation.gameId },
      data: { status: GameStatus.aborted },
    });

    this.eventEmitter.emit(
      'chellange.rejected',
      game.playerWhiteId,
      game.playerBlackId,
      game.id,
    );

    return game;
  }

  async findAllInvitations(
    { userId }: UserPayloadDto,
    { page, limit }: PaginationDto,
  ) {
    const total = await this.prisma.invitation.count({
      where: { toId: userId, status: Status.pending },
    });
    const unRead = await this.prisma.invitation.count({
      where: { toId: userId, status: Status.pending, read: false },
    });
    const totalPages = (page - 1) * limit;
    const invites = await this.prisma.invitation.findMany({
      where: { toId: userId, status: Status.pending },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: { from: { omit: { password: true } } },
    });

    return {
      data: invites,
      pagination: { page, limit, total, totalPages, unRead },
    };
  }

  async readAllInvitations({ userId }: UserPayloadDto) {
    return await this.prisma.invitation.updateMany({
      where: { toId: userId, status: Status.pending, read: false },
      data: { read: true },
    });
  }
}
