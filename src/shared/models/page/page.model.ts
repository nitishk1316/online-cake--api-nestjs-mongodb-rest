import { Schema, Document } from "mongoose";

/**
 * Page Schema
 */
export const PageSchema = new Schema({
	title: { type: String },
	desc: { type: String },
	url: { type: String },
	active: { type: Boolean, default: true }
}, {
	timestamps: true
});

/**
 * Page Document
 */
export interface IPage extends Document {
	readonly _id: string;
	readonly title: string;
	readonly desc: string;
	readonly url: string;
	readonly active: boolean;
}