import { Schema, Document } from "mongoose";

/**
 * Type Schema
 */
export const TypeSchema = new Schema({
	_id: { type: Number },
	title: { type: String },
	slug: { type: String },
	image: { type: String },
	active: { type: Boolean, default: true },
	popular: { type: Boolean, default: false },
}, {
	timestamps: true
});
TypeSchema.index({ active: 1, title: 1 });

/**
 * Type Document
 */
export interface IType extends Document {
	readonly _id: number;
	readonly title: string;
	readonly slug: string;
	readonly image: string;
	readonly active: boolean;
	readonly popular: boolean;
}