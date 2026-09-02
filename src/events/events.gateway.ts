import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway {
  @WebSocketServer()
  server!: Server;

  // Emit booking updated event to all connected clients
  emitBookingUpdated(bookingId: string, data: any) {
    this.server.emit('booking.updated', { bookingId, ...data });
  }

  // Emit notification to all connected clients
  emitNotification(notification: any) {
    this.server.emit('notification', notification);
  }

  // Emit mechanic location updated
  emitMechanicLocationUpdated(mechanicId: string, location: { latitude: number; longitude: number }) {
    this.server.emit('mechanic.location.updated', { mechanicId, ...location });
  }

  @SubscribeMessage('join')
  handleJoin(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    client.join(data.room);
    return { event: 'joined', data };
  }
}
