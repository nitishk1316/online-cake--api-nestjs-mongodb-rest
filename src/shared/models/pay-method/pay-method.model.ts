import { Schema, Document } from "mongoose";

/**
 * Payment method Schema
 */
export const PayMethodSchema = new Schema({
	method: { type: String },
	active: { type: Boolean, default: true },
}, {
	timestamps: true
});

/**
 * Payment method Document
 */
export interface IPayMethod extends Document {
	readonly method: string;
	readonly active: boolean;
}