import { Schema, Document } from "mongoose";
import { Geometry } from "src/shared/classes/delivery-coverage/delivery-coverage-admin.dto";

/**
 * Delivery Coverage Schema
 */
export const DeliveryCoverageSchema = new Schema({
	_id: { type: Number },
	geometry: {
		type: { type: String },
		coordinates: [Schema.Types.Mixed],
	},
	name: { type: String },
}, {
	timestamps: true
});
DeliveryCoverageSchema.index({ geometry: "2dsphere" })

/**
 * Delivery Coverage Document
 */
export interface IDeliveryCoverage extends Document {
	readonly _id: number;
	readonly name: string;
	readonly geometry: Geometry;
}