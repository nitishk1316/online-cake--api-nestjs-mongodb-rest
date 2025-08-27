import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import {
	NotificationPayload,
	NotificationType,
	NotificationAdminSearch,
	DeleteResult
} from 'src/shared/classes';
import { INotification } from 'src/shared/models';
import { EventGateway, UploadService } from 'src/shared/services';

/**
 * Notification Service
 */
@Injectable()
export class NotificationAdminService {
	/**
	 * constructor
	 * @param notificationModel
	 * @param eventGateway
	 * @param uploadService
	 */
  constructor(
		@InjectModel("Notification") private readonly notificationModel: Model<INotification>,
		private readonly eventGateway: EventGateway,
		private readonly uploadService: UploadService,
	) {
		this.eventGateway.notification$.subscribe((data: NotificationPayload) => {
			if(data.notifyType == NotificationType.EXPORT) {
				this.export(data);
			} else if(data.notifyType == NotificationType.IMPORT) {
				this.import(data);
			}
		});
	}

	/**
	* Get all notifications
	* @param payload
	* @return INotification[] - notification list
	*/
	getAll(payload: NotificationAdminSearch): Promise<INotification[]> {
		const skip = payload.page * payload.limit;
		let filter = { };
		return this.notificationModel.find(filter, 'notifyType read orderId url createdAt').sort({ createdAt: -1 }).skip(skip).limit(payload.limit).exec();
	}

	/**
	* Count all notifications
	* @return Number - Count of notifications
	*/
	countAll(): Promise<number> {
		let filter = { };
		return this.notificationModel.countDocuments(filter).exec();
	}

	/**
	* Get notification by id
	* @param id
	* @return INotification - notification detail
	*/
	getById(id: string): Promise<INotification> {
		return this.notificationModel.findById(id).exec();
	}

	/**
	* Count unread notification
	* @return {Promise<Number>} Count of unread notification
	*/
	countUnread(): Promise<number> {
		return this.notificationModel.countDocuments({ read: false }).exec();
	}

	/**
	* Mark as read
	* @param id
	* @return UpdateWriteOpResult - update document
	*/
	markRead(id: string): Promise<UpdateWriteOpResult> {
		return this.notificationModel.updateOne({ _id: id }, { read: true }).exec();
	}

	/**
	* Mark all as read
	* @return UpdateWriteOpResult - update document
	*/
	markAllRead(): Promise<UpdateWriteOpResult> {
		return this.notificationModel.updateMany({ }, { read: true }).exec();
	}

	/**
	* Delete notification
	* @param id
	* @return DeleteResult - delete document
	*/
	delete(id: string): Promise<DeleteResult> {
		return this.notificationModel.deleteOne({ _id: id }).exec();
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

	/**
	* Product exported
	* @param payload
	* @return INotification - notification detail
	*/
	export(payload: NotificationPayload): Promise<INotification> {
		payload.notifyType = NotificationType.EXPORT;
		this.eventGateway.notify(payload);
		return this.notificationModel.create(payload);
	}

	/**
	* Product imported
	* @param payload
	* @return INotification - notification detail
	*/
	import(payload: NotificationPayload): Promise<INotification> {
		payload.notifyType = NotificationType.IMPORT;
		this.eventGateway.notify(payload);
		return this.notificationModel.create(payload);
	}

	/**
	 * Remove export files from imagekit after 10 minutes
	 */
	async removeExportFile() {
		const d1 = new Date();
		d1.setMinutes(d1.getMinutes() - 10);

		const list = await this.notificationModel.find({ createdAt: { $lt: d1 }, notifyType: NotificationType.EXPORT }).exec();
		if (list) {
			list.forEach((n: INotification) => {
				this.delete(n._id);
				this.uploadService.deleteImage(n.fileId);
			});
		}
	}
}
