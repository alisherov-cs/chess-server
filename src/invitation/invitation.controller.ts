import {
  Body,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { InvitationService } from './invitation.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserPayloadDto } from 'src/auth/dto/payload.dto';
import { ChellangeDto } from './dto/chellange.dto';

@Controller('invitation')
export class InvitationController {
  constructor(private readonly invitationService: InvitationService) {}

  @Get('')
  @UseGuards(JwtAuthGuard)
  async findAllInvitations(
    @Request() req: { user: UserPayloadDto },
    @Query('page', ParseIntPipe) page = 1,
    @Query('limit', ParseIntPipe) limit = 10,
  ) {
    return await this.invitationService.findAllInvitations(req.user, {
      page,
      limit,
    });
  }

  @Post('readAll')
  @UseGuards(JwtAuthGuard)
  async readAllInvitation(@Request() req: { user: UserPayloadDto }) {
    return this.invitationService.readAllInvitations(req.user);
  }

  @Post('chellangeFriend')
  @UseGuards(JwtAuthGuard)
  async chellangeFriend(
    @Request() req: { user: UserPayloadDto },
    @Body() chellangeDto: ChellangeDto,
  ) {
    return await this.invitationService.chellangeFriend(req.user, chellangeDto);
  }

  @Post('rejectChellange')
  @UseGuards(JwtAuthGuard)
  async rejectChellange(
    @Request() req: { user: UserPayloadDto },
    @Body() { invitationId }: { invitationId: string },
  ) {
    return await this.invitationService.rejectInvitation(
      req.user,
      invitationId,
    );
  }

  @Post('acceptChellange')
  @UseGuards(JwtAuthGuard)
  async acceptChellange(
    @Request() req: { user: UserPayloadDto },
    @Body() { invitationId }: { invitationId: string },
  ) {
    return await this.invitationService.acceptInvitation(
      req.user,
      invitationId,
    );
  }
}
