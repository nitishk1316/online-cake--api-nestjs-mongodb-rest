import { Schema, Document } from "mongoose";
import { Tax, CartCoupon, CartProduct, Currency } from "src/shared/classes";

/**
 * Cart Schema
 */
export const CartSchema = new Schema({
	_id: { type: Number },
	anonymousId: { type: String },
	user: { type: Number },
	count: { type: Number, default: 0 },
	minimumForFree: { type: Number, default: 0 },
	applyDeliveryCharges: { type: Number, default: 0 },
	products: [{
		_id: { type: Number },
		title: { type: String },
		slug: { type: String },
		thumbnail: { type: String },
		sku: { type: String },
		capacity: { type: String },
		quantity: { type: Number },
		originalPrice: { type: Number },
		sellingPrice: { type: Number },
		discount: { type: Number },
		total: { type: Number },
		type: { type: Number },
		flavour: { type: Number },
		occasion: { type: Number },
		message: { type: String },
		eggless: { type: Boolean, default: false },
	}],
	subTotal: { type: Number, default: 0 },
	payTotal: { type: Number, default: 0 },
	grandTotal: { type: Number, default: 0 },
	tax: {
		title: { type: String },
		percent: { type: Number, default: 0 },
	},
	taxType: { type: String },
	taxPrice: { type: Number, default: 0 },
	deliveryCharges: { type: Number, default: 0 },
	address: { type: Number },
	currency: {
		code: { type: String },
		symbol: { type: String }
	},
	coupon: {
		code: { type: String },
		discount: { type: Number, default: 0 },
	},
	status: { type: Boolean, default: true },
	slot: { type: String },
	isWalletUsed: { type: Boolean, default: false },
	walletAmount: { type: Number, default: 0 },
}, {
	timestamps: true
});

/**
 * Cart Document
 */
export interface ICart extends Document {
	readonly _id: number;
	readonly anonymousId: string;
  readonly user: number;
	readonly count: number;
	readonly products: CartProduct[];
	readonly subTotal: number;
	readonly payTotal: number;
	readonly grandTotal: number;
	readonly deliveryCharges: number;
	readonly tax: Tax;
	readonly taxType: string;
	readonly taxPrice: number;
	readonly currency: Currency;
	readonly address: number;
	readonly coupon: CartCoupon;
	readonly slot: string;
	readonly status: boolean;
	readonly isWalletUsed: boolean;
	readonly walletAmount: number;
	readonly minimumForFree: number;
	readonly applyDeliveryCharges: number;
}