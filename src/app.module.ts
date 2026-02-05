import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './services/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FriendsModule } from './friends/friends.module';
import { InvitationModule } from './invitation/invitation.module';
import { SocketGateway } from './socket/socket.gateway';
import { GameModule } from './game/game.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    EventEmitterModule.forRoot(),
    FriendsModule,
    InvitationModule,
    GameModule,
  ],
  controllers: [],
  providers: [SocketGateway],
})
export class AppModule {}
