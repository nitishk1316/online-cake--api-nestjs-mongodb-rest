import { Schema, Document } from "mongoose";

/**
 * Order Schema
 */
export const OrderProductSchema = new Schema({
		orderId: { type: Number },
		productId: { type: Number },
		title: { type: String },
		slug: { type: String },
		thumbnail: { type: String },
		sku: { type: String },
		capacity: { type: String },
		sellingPrice: { type: Number },
		originalPrice: { type: Number },
		total: { type: Number },
		quantity: { type: Number },
		type: { type: Number },
		flavour: { type: Number },
		occasion: { type: Number },
		status: { type: String },
		message: { type: String },
		eggless: { type: Boolean, default: false },
		isCancelled: { type: Boolean, default: false },
}, {
	timestamps: true
});
OrderProductSchema.index({ orderId: 1, productId: 1, sku: 1, type: 1, isCancelled: 1 });

/**
 * Order Document
 */
export interface IOrderProduct extends Document {
	readonly orderId?: number;
  readonly productId: number;
	readonly title: string;
	readonly slug: string;
	readonly thumbnail: string;
	readonly sku: string;
	readonly capacity: string;
	readonly sellingPrice: number;
	readonly originalPrice: number;
	readonly total: number;
	readonly quantity: number;
	readonly type: number;
	readonly flavour: number;
	readonly occasion: number;
	readonly message: string;
	readonly eggless: boolean;
	readonly isCancelled?: boolean;
}
