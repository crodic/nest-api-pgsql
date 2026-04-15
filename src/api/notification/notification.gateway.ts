import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationGateway {
  @WebSocketServer() server: Server;

  private onlineUsers = new Map<string, number>();

  sendToUser(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', notification);
  }

  sendGlobal(payload: any) {
    this.server.emit('notification', payload);
  }

  sendToRoom(roomName: string, payload: any) {
    this.server.to(roomName).emit('notification', payload);
  }

  sendToAllExceptUser(userId: string, payload: any) {
    this.server.except(`user_${userId}`).emit('notification', payload);
  }

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) return;

    client.join(`user_${userId}`);

    const count = this.onlineUsers.get(userId) || 0;
    this.onlineUsers.set(userId, count + 1);

    this.onlineUsers.forEach((value, key) => {
      console.log('key:', key, 'value:', value);
    });

    console.log('Size: ', this.onlineUsers.size);

    this.sendOnlineCount();

    console.log(`User ${userId} connected.`);
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;

    if (!userId) return;

    const count = this.onlineUsers.get(userId) || 0;
    if (count <= 1) {
      this.onlineUsers.delete(userId);
    } else {
      this.onlineUsers.set(userId, count - 1);
    }

    this.sendOnlineCount();

    console.log(`User ${userId} disconnected.`);
  }

  getOnlineCount() {
    return this.onlineUsers.size;
  }

  sendOnlineCount() {
    this.server.emit('onlineCount', this.getOnlineCount());
  }
}
