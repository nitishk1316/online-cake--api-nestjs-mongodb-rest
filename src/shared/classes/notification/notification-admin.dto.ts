import { IsOptional } from "class-validator";
/**
 * Notification Type
 */
export enum NotificationType {
	ORDER_PLACED = 'ORDER_PLACED',
	ORDER_CANCELLED = 'ORDER_CANCELLED',
	IMPORT = 'IMPORT',
	EXPORT = 'EXPORT',
}

/**
 * Notification Payload
 */
export class NotificationPayload {
	@IsOptional()
	orderId?: number;

	@IsOptional()
	url?: string;

	@IsOptional()
	fileId?: string;

	notifyType?: string;
}

/**
 * Notification
 */
export class NotificationAdmin {
	_id: string;
	notifyType: string;
	read: boolean;
	orderId?: number;
	url?: string;
}

/**
 * Notification List
 */
export class NotificationAdminList {
	data: NotificationAdmin[];
	total: number;
}

/**
 * Notification Unread Payload
 */
export class NotificationAdminUnread {
	count: number;
}

/**
 * Notification Pagination
 */
export class NotificationAdminSearch {
	page?: number;
	limit?: number;
}