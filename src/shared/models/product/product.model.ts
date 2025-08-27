import { Schema, Document } from "mongoose";
import { VariantAdmin } from "src/shared/classes";

/**
 * Product Schema
 */
export const ProductSchema = new Schema({
	_id: { type: Number },
	title: { type: String },
	slug: { type: String },
	desc: { type: String },
	images: { type: [String] },
	thumbnail: { type: String },
	variants: [
		{
			sku: { type: String },
			capacity: { type: String },
			stock: { type: Number },
			originalPrice: { type: Number },
			sellingPrice: { type: Number },
			discount: { type: Number },
			active: { type: Boolean, default: true },
		}
	],
	type: { type: Number },
	flavour: { type: Number },
	occasion: { type: Number },
	popular: { type: Boolean, default: false },
	active: { type: Boolean, default: true }
}, {
	timestamps: true
});
ProductSchema.index({ capacity: 1, type: 1, active: 1, title: 1 });

/**
 * Product Document
 */
export interface IProduct extends Document {
	readonly _id: number;
	readonly title: string;
	readonly slug: string;
	readonly desc: string;
	readonly images: string[];
	readonly thumbnail: string;
	readonly variants: VariantAdmin[];
	readonly type: number;
	readonly flavour: number;
	readonly occasion: number;
	readonly popular: boolean;
	readonly active: boolean;
}