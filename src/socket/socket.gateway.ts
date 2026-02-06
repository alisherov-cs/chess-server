import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Invitation } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { PlayerMovedDto } from 'src/game/dto/update.dto';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://192.168.0.118:5173'],
  },
})
export class SocketGateway {
  constructor(private eventEmitter: EventEmitter2) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinOwnRoom')
  joinOwnRoom(@ConnectedSocket() client: Socket, @MessageBody() id: string) {
    client.join(id);
  }

  @SubscribeMessage('joinGameRoom')
  joinGameRoom(@ConnectedSocket() client: Socket, @MessageBody() id: string) {
    client.join(id);
  }

  @OnEvent('chellange.created')
  chellangeCreated(userId: string, invitation: Invitation) {
    this.server.to(userId).emit('newChellange', invitation);
  }

  @OnEvent('incomingFriendRequest')
  incomingFriendRequest(userId: string) {
    this.server.to(userId).emit('incomingFriendRequest');
  }

  @OnEvent('chellange.rejected')
  rejectChellange(
    playerWhiteId: string,
    playerBlackId: string,
    gameId: string,
  ) {
    this.server
      .to([playerWhiteId, playerBlackId])
      .emit('chellange.rejected', gameId);
  }

  @OnEvent('chellange.accepted')
  acceptChellange(
    playerWhiteId: string,
    playerBlackId: string,
    gameId: string,
  ) {
    this.server
      .to([playerWhiteId, playerBlackId])
      .emit('chellange.accepted', gameId);
  }

  @SubscribeMessage('playerMoved')
  playerMoved(
    @MessageBody() { currentPosition, history, gameId, userId }: PlayerMovedDto,
  ) {
    this.eventEmitter.emit('newMove', userId, gameId, currentPosition, history);
    this.server.to(gameId).emit('newMove', currentPosition, history);
  }
}
