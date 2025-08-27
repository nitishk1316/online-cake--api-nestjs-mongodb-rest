import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { INotification } from 'src/shared/models';
import { EventGateway } from 'src/shared/services';
import { NotificationPayload, NotificationType } from 'src/shared/classes';
import { Model } from "mongoose";

/**
 * Notification Service
 */
@Injectable()
export class NotificationService {
	/**
	 * constructor
	 * @param notificationModel
	 * @param eventGateway
	 */
  constructor(
		@InjectModel("Notification") private readonly notificationModel: Model<INotification>,
		private readonly eventGateway: EventGateway,
	) {
	}

	/**
	* Create order
	* @param payload
	* @return INotification - notification detail
	*/
	createOrder(payload: NotificationPayload): Promise<INotification> {
		payload.notifyType = NotificationType.ORDER_PLACED;
		this.eventGateway.notify(payload);
		return this.notificationModel.create(payload);
	}

	/**
	* Cancel order
	* @param payload
	* @return INotification - notification detail
	*/
	cancelOrder(payload: NotificationPayload): Promise<INotification> {
		payload.notifyType = NotificationType.ORDER_CANCELLED;
		this.eventGateway.notify(payload);
		return this.notificationModel.create(payload);
	}
}
