import { Schema, Document } from "mongoose";

/**
 * Notification Schema
 */
export const NotificationSchema = new Schema({
	notifyType: { type: String },
	read: { type: Boolean, default: false },
	orderId: { type: Number },
	fileId: { type: String },
	url: { type: String },
}, {
	timestamps: true
});

/**
 * Notification Document
 */
export interface INotification extends Document {
	readonly _id: string;
	readonly notifyType: string;
	readonly read: boolean;
	readonly orderId: number;
	readonly fileId: string;
	readonly url: string;
}