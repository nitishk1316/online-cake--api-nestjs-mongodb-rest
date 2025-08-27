import { Schema, Document } from "mongoose";

/**
 * User Schema
 */
export const UserSchema = new Schema({
	_id: { type: Number },
	firstName: { type: String },
	lastName: { type: String },
	email: { type: String, trim: true, lowercase: true },
	password: { type: String },
	salt: { type: String },
	role: { type: String },
	mobileNumber: { type: String },
	emailVerified: { type: Boolean, default: false },
	mobileVerified: { type: Boolean, default: false },
	orderPurchased: { type: Number, default: 0 },
	orderDelivered: { type: Number, default: 0 },
	active: { type: Boolean, default: true },
	playerId: { type: String },
	walletAmount: { type: Number, default: 0 },
}, {
	timestamps: true
});
UserSchema.index({ active: 1, orderPurchased: 1, firstName: 1, lastName: 1, email: 1, mobileNumber: 1 });

/**
 * User Document
 */
export interface IUser extends Document {
	readonly _id: number;
	readonly email: string;
	readonly role: string;
	readonly mobileNumber: string;
	readonly active: boolean;
	readonly firstName: string;
	readonly lastName: string;
	readonly password: string;
	readonly salt: string;
	readonly orderPurchased: number;
	readonly orderDelivered: number;
	readonly emailVerified: boolean;
	readonly mobileVerified: boolean;
	readonly createdAt: string;
	readonly playerId: string;
	readonly walletAmount: number;
}