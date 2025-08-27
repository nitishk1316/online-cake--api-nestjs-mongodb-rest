import { Schema, Document } from "mongoose";

/**
 * Sequence Schema
 */
export const SequenceSchema = new Schema({
	_id: { type: String },
	value: { type: Number, default: 0 }
}, {
	timestamps: true
});
SequenceSchema.index({ type: 1 });

/**
 * Sequence Document
 */
export interface ISequence extends Document {
	readonly _id: string;
	readonly value: number;
}