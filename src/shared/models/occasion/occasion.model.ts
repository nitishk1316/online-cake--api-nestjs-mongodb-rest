import { Schema, Document } from "mongoose";

/**
 * Occasion Schema
 */
export const OccasionSchema = new Schema({
	_id: { type: Number },
	title: { type: String },
	slug: { type: String },
	image: { type: String },
	active: { type: Boolean, default: true },
	popular: { type: Boolean, default: false },
}, {
	timestamps: true
});
OccasionSchema.index({ active: 1, title: 1 });

/**
 * Occasion Document
 */
export interface IOccasion extends Document {
	readonly _id: number;
	readonly title: string;
	readonly slug: string;
	readonly image: string;
	readonly active: boolean;
	readonly popular: boolean;
}