import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Status } from '@prisma/client';
import { UserPayloadDto } from 'src/auth/dto/payload.dto';
import { PaginationDto } from 'src/dto/pagination.dto';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async findFriends(
    { userId }: UserPayloadDto,
    { page, limit }: PaginationDto,
    search?: string,
  ) {
    const whereClues = {
      OR: [{ userId }, { friendId: userId }],
      status: Status.accepted,
    };

    if (search) {
      whereClues.OR.push({
        //@ts-ignore
        friend: {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
          ],
        },
        user: {
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { username: { contains: search, mode: 'insensitive' } },
          ],
        },
      });
    }

    const total = await this.prisma.friend.count({
      where: whereClues,
    });
    const totalPages = Math.ceil(total / limit);
    const friends = await this.prisma.friend.findMany({
      where: whereClues,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        friend: { omit: { password: true } },
        user: { omit: { password: true } },
      },
    });

    return {
      data: friends.map((item) =>
        item.friend.id === userId ? item.user : item.friend,
      ),
      pagination: { page, limit, total, totalPages },
    };
  }

  async findFriendById({ userId }: UserPayloadDto, friendId: string) {
    const existsAsUser = await this.prisma.friend.findUnique({
      where: { userId_friendId: { userId, friendId } },
      include: { friend: true },
    });

    const existsAsFriend = await this.prisma.friend.findUnique({
      where: { userId_friendId: { userId: friendId, friendId: userId } },
      include: { user: true },
    });

    if (!existsAsUser && !existsAsFriend)
      throw new NotFoundException('friend not found!');

    return existsAsUser?.friend || existsAsFriend?.user;
  }

  async findSuggestions({ userId }: UserPayloadDto, search: string) {
    const users = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        friends: { none: { id: { not: userId }, status: Status.accepted } },
        friended: { none: { id: { not: userId }, status: Status.accepted } },
        OR: [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      },
      take: 5,
      orderBy: {
        createdAt: 'desc',
      },
      include: { friended: { where: { userId } } },
    });

    return {
      data: users,
      pagination: { page: 1, limit: 5, total: users.length, totalPages: 1 },
    };
  }

  async sendFriendRequest({ userId }: UserPayloadDto, friendId: string) {
    const exists = await this.prisma.friend.findUnique({
      where: { userId_friendId: { userId, friendId } },
    });

    if (exists) throw new BadRequestException('friend already exists');

    return await this.prisma.friend.create({ data: { userId, friendId } });
  }

  async findIncomingRequests(
    { userId }: UserPayloadDto,
    { page, limit }: PaginationDto,
  ) {
    const total = await this.prisma.friend.count({
      where: { friendId: userId, status: Status.pending },
    });
    const totalPages = (page - 1) * limit;
    const incomingRequests = await this.prisma.friend.findMany({
      where: { friendId: userId, status: Status.pending },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: { user: true },
    });

    return {
      data: incomingRequests,
      pagination: { page, limit, total, totalPages },
    };
  }

  async findOutgoingRequests(
    { userId }: UserPayloadDto,
    { page, limit }: PaginationDto,
  ) {
    const total = await this.prisma.friend.count({
      where: { userId, status: Status.pending },
    });
    const totalPages = (page - 1) * limit;
    const outgoingRequests = await this.prisma.friend.findMany({
      where: { userId, status: Status.pending },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
      include: { friend: true },
    });

    return {
      data: outgoingRequests,
      pagination: { page, limit, total, totalPages },
    };
  }

  async cancelFriendRequest({ userId }: UserPayloadDto, friendId: string) {
    const exists = await this.prisma.friend.findUnique({
      where: { userId_friendId: { userId, friendId }, status: Status.pending },
    });

    if (!exists) return null;

    return await this.prisma.friend.update({
      where: { userId_friendId: { userId, friendId }, status: Status.pending },
      data: { status: Status.rejected },
    });
  }

  async acceptFriendRequest({ userId }: UserPayloadDto, friendId: string) {
    const exists = await this.prisma.friend.findUnique({
      where: {
        userId_friendId: { friendId: userId, userId: friendId },
        status: Status.pending,
      },
    });

    if (!exists) return null;

    return await this.prisma.friend.update({
      where: {
        userId_friendId: { friendId: userId, userId: friendId },
        status: Status.pending,
      },
      data: { status: Status.accepted },
    });
  }
}
