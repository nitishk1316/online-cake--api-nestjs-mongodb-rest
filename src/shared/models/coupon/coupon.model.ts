import { Schema, Document } from "mongoose";

/**
 * Coupon Schema
 */
export const CouponSchema = new Schema({
	_id: { type: Number },
	code: { type: String, lowercase: true },
	couponType: { type: String },
	discount: { type: Number },
	minAmount: { type: Number },
	maxDiscount: { type: Number },
	startDate: { type: Date },
	endDate: { type: Date },
	type: { type: Number },
	active: { type: Boolean, default: true }
}, {
	timestamps: true
});
CouponSchema.index({ active: 1, code: 1, couponType: 1, type: 1 });

/**
 * Coupon Document
 */
export interface ICoupon extends Document {
	readonly _id: number;
	readonly code: string;
	readonly couponType: string;
	readonly discount: number;
	readonly minAmount: number;
	readonly maxDiscount: number;
	readonly startDate: Date;
	readonly endDate: Date;
	readonly type: number;
	readonly active: boolean;
}