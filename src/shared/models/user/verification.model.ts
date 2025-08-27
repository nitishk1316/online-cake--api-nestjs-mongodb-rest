import { Schema, Document } from "mongoose";

/**
 * Verification Schema
 */
export const VerificationSchema = new Schema({
	userId: { type: Number },
	otp: { type: String },
	expiry: { type: Number },
	verificationToken: { type: String },
	email: { type: String },
	mobileNumber: { type: String },
}, {
	timestamps: true
});

/**
 * Verification Document
 */
export interface IVerification extends Document {
	readonly userId: number;
	readonly otp: string;
	readonly expiry: number;
	readonly verificationToken: string;
	readonly email: string;
	readonly mobileNumber: string;
}