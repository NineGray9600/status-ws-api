import { SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayInit {

  @WebSocketServer() wss: Server;

  public users: any[] = [];

  private logger: Logger = new Logger('ChatGateway');

  afterInit(server: any) {
    this.logger.log('Initialized!');
  }

  @SubscribeMessage('chatToServer')
  handleMessage(client: Socket, message: { sender: string, room: string, message: string }) {
    const user = this.users[message.room].find(u => u.user === message.sender);
    user.status = message.message;
    this.wss.to(message.room).emit('chatToClient', message);
    console.log(this.users);
    
  }

  @SubscribeMessage('joinRoom')
  handleRoomJoin(client: Socket, [room, username]) {
    if(!this.users[room]) this.users[room] = [];
    this.users[room].push({user: username, status: ''});
    client.join(room);
    client.emit('joinedRoom', room);
  }
  
  @SubscribeMessage('leaveRoom')
  handleRoomLeave(client: Socket, [room, username] ) {
    console.log(username);
    
    if (this.users[room])
    {
      const user = this.users[room].find(u => u.user === username);
      this.users[room] = this.users[room].filter(u => u.user !== username);
    }
    client.leave(room);
    client.emit('leftRoom', room);
  }

}
