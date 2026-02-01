import { Module } from '@nestjs/common';
import { TestGateway } from './socket/test/test.gateway';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './services/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FriendsModule } from './friends/friends.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    EventEmitterModule.forRoot(),
    FriendsModule,
  ],
  controllers: [],
  providers: [TestGateway],
})
export class AppModule {}
