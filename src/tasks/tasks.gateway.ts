import {
  ConnectedSocket,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import type { JwtPayload } from '../auth/jwt.types';

type AuthedSocket = Socket & { user?: JwtPayload };

@WebSocketGateway({
  namespace: '/tasks',
  cors: { origin: '*' },
})
export class TasksGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private readonly jwt: JwtService) {}

  async handleConnection(client: AuthedSocket) {
    const token = this.extractToken(client);
    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const user = await this.jwt.verifyAsync<JwtPayload>(token);
      client.user = user;
      await client.join(`user:${user.sub}`);
    } catch {
      client.disconnect(true);
    }
  }

  @SubscribeMessage('tasks.subscribe')
  async subscribe(@ConnectedSocket() client: AuthedSocket) {
    if (!client.user) return { ok: false };
    await client.join(`user:${client.user.sub}`);
    return { ok: true };
  }

  emitTaskCreated(userId: string, task: unknown) {
    this.server.to(`user:${userId}`).emit('task.created', task);
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim()) return authToken.trim();

    const queryToken = client.handshake.query?.token;
    if (typeof queryToken === 'string' && queryToken.trim()) return queryToken.trim();

    const header = client.handshake.headers.authorization;
    if (typeof header === 'string' && header.startsWith('Bearer ')) {
      return header.slice('Bearer '.length).trim();
    }

    return null;
  }
}
