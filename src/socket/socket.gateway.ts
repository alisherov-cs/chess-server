import { OnEvent } from '@nestjs/event-emitter';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Invitation } from '@prisma/client';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
  },
})
export class SocketGateway {
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
}
