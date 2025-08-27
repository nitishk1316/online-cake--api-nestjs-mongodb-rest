import {
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { Subject } from 'rxjs';
import { NotificationPayload } from 'src/shared/classes';

/**
 * Event Gateway
 */
@Injectable()
@WebSocketGateway()
export class EventGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
	@WebSocketServer() server: Server;

	private notification = new Subject<NotificationPayload>();
	public notification$ = this.notification.asObservable();

	constructor() {
	}

	/**
	 * Handle socket connection
	 * @param client
	 * @param args
	 */
	public handleConnection(client: Socket, ...args: any[]): any {
		console.log('CONNECTED');
	}

	/**
	 * Handle socket disconnect
	 * @param client
	 */
	public handleDisconnect(client: Socket): any {
		console.log('DISCONNECTED');
	}

	/**
	 * After init scoket
	 * @param server
	 */
	afterInit(server: Server): any {
		console.log('WEBSOCKET GATWEAY INITIALIZED');
	}

	/**
	 * Sed notification to ADMIN
	 * @param payload
	 */
	public notify(payload: NotificationPayload) {
		console.log('admin_notify', payload);
		this.server.emit(`admin_notify`, payload);
	}

	public setNotification(notification: NotificationPayload) {
		this.notification.next(notification);
	}
}