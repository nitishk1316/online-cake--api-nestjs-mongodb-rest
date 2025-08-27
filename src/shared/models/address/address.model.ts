import { Schema, Document } from "mongoose";
import { MapLocation } from "src/shared/classes";

/**
 * Address Schema
 */
export const AddressSchema = new Schema({
	_id: { type: Number },
	name: { type: String },
	address: { type: String },
	flat: { type: String },
	street: { type: String },
	mobileNumber: { type: String },
	addressType: { type: String },
	location: {
		latitude: { type: Number },
		longitude: { type: Number },
	},
	country: { type: String },
	user: { type: Number },
}, {
	timestamps: true
});

/**
 * Address Document
 */
export interface IAddress extends Document {
	readonly _id: number;
	readonly name: string;
	readonly address: string;
	readonly flat: string;
	readonly street: string;
	readonly mobileNumber: string;
	readonly addressType: string;
  readonly location: MapLocation;
	readonly country: string;
	readonly user: number;
}