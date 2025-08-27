import { Schema, Document } from "mongoose";

/**
 * Flavour Schema
 */
export const FlavourSchema = new Schema({
	_id: { type: Number },
	title: { type: String },
	slug: { type: String },
	image: { type: String },
	active: { type: Boolean, default: true },
	popular: { type: Boolean, default: false },
}, {
	timestamps: true
});
FlavourSchema.index({ active: 1, title: 1 });

/**
 * Flavour Document
 */
export interface IFlavour extends Document {
	readonly _id: number;
	readonly title: string;
	readonly slug: string;
	readonly image: string;
	readonly active: boolean;
	readonly popular: boolean;
}