import { Schema, Document } from "mongoose";

/**
 * Deal Schema
 */
export const DealSchema = new Schema({
	_id: { type: Number },
	title: { type: String },
	slug: { type: String },
	dealType: { type: String },
	value: { type: Number },
	image: { type: String },
	active: { type: Boolean, default: true },
	type: { type: Number }
}, {
	timestamps: true
});
DealSchema.index({ active: 1, title: 1, dealType: 1 });

/**
 * Deal Document
 */
export interface IDeal extends Document {
	readonly _id: number;
	readonly title: string;
	readonly slug: string;
	readonly dealType: string;
	readonly value: number;
	readonly image: string;
	readonly active: boolean;
	readonly type: number;
}