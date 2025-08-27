import { Schema, Document } from "mongoose";

/**
 * Banner Schema
 */
export const BannerSchema = new Schema({
	_id: { type: Number },
	title: { type: String },
	slug: { type: String },
	bannerType: { type: String },
	image: { type: String },
	link: { type: String },
	type: { type: Number },
	active: { type: Boolean, default: true },
}, {
	timestamps: true
});
BannerSchema.index({ active: 1, title: 1, bannerType: 1 });

/**
 * Banner Document
 */
export interface IBanner extends Document {
	readonly _id: number;
	readonly title: string;
	readonly slug: string;
	readonly bannerType: string;
	readonly image: string;
	readonly active: boolean;
	readonly link: string;
	readonly type: number;
}