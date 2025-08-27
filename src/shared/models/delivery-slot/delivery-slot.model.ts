import { Schema, Document } from "mongoose";
import { TimingPayload } from "src/shared/classes/delivery-slot/delivery-slot-admin.dto";

/**
 * Delivery Slot Schema
 */
export const DeliverySlotSchema = new Schema({
	_id: { type: Number },
	isOpen: { type: Boolean, default: true },
	timings: [
		{
			open: { type: Number },
			close: { type: Number },
			time: { type: String },
			key: { type: String },
			isOpen: { type: Boolean, default: true }
		}
	]
}, {
	timestamps: true
});
DeliverySlotSchema.index({ "timings.key": 1 }, { unique: true } );


/**
 * Delivery Slot Document
 */
export interface IDeliverySlot extends Document {
	readonly _id: number;
	readonly isOpen: boolean;
	readonly timings: TimingPayload[];
}