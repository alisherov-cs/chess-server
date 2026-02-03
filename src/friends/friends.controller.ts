import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FriendsService } from './friends.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserPayloadDto } from 'src/auth/dto/payload.dto';

@Controller('friends')
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  async findFriends(
    @Request() req: { user: UserPayloadDto },
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
    @Query('search') search?: string,
  ) {
    return await this.friendsService.findFriends(
      req.user,
      { page, limit },
      search,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findFriendById(
    @Request() req: { user: UserPayloadDto },
    @Param('id') id: string,
  ) {
    return await this.friendsService.findFriendById(req.user, id);
  }

  @Get('suggestions')
  @UseGuards(JwtAuthGuard)
  async findSuggestions(
    @Request() req: { user: UserPayloadDto },
    @Query('search') search: string,
  ) {
    return await this.friendsService.findSuggestions(req.user, search);
  }

  @Post('sendFriendRequest')
  @UseGuards(JwtAuthGuard)
  async sendFriendRequest(
    @Request() req: { user: UserPayloadDto },
    @Body() { friendId }: { friendId: string },
  ) {
    return await this.friendsService.sendFriendRequest(req.user, friendId);
  }

  @Post('cancelFriendRequest')
  @UseGuards(JwtAuthGuard)
  async cancelFriendRequest(
    @Request() req: { user: UserPayloadDto },
    @Body() { friendId }: { friendId: string },
  ) {
    return await this.friendsService.cancelFriendRequest(req.user, friendId);
  }

  @Post('acceptFriendRequest')
  @UseGuards(JwtAuthGuard)
  async acceptFriendRequest(
    @Request() req: { user: UserPayloadDto },
    @Body() { friendId }: { friendId: string },
  ) {
    return await this.friendsService.acceptFriendRequest(req.user, friendId);
  }

  @Get('incomingRequests')
  @UseGuards(JwtAuthGuard)
  async incomingRequests(
    @Request() req: { user: UserPayloadDto },
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return await this.friendsService.findIncomingRequests(req.user, {
      page,
      limit,
    });
  }

  @Get('outgoingRequests')
  @UseGuards(JwtAuthGuard)
  async outgoingRequests(
    @Request() req: { user: UserPayloadDto },
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return await this.friendsService.findOutgoingRequests(req.user, {
      page,
      limit,
    });
  }
}
