import { Schema, Document } from "mongoose";
import { MapLocation } from "src/shared/classes";
import { CurrencyAdmin, TaxAdmin } from "src/shared/classes/setting/setting-admin.dto";

export enum TaxType {
	INCLUDED = 'INCLUDED',
	EXCLUDED = 'EXCLUDED'
}

/**
 * Settings Schema
 */
export const SettingSchema = new Schema({
	_id: { type: Number },
	storeName: { type: String },
	address: { type: String },
	email: { type: String },
	phoneNumber: { type: String },
	deliveryCharges: { type: Number, default: 0 },
	minimumForFree: { type: Number },
	taxType: { type: String },
	currency: {
		code: { type: String },
		symbol: { type: String }
	},
	tax: {
		title: { type: String },
		percent: { type: Number }
	},
	location: {
		latitude: { type: Number },
		longitude: { type: Number },
	},
}, {
	timestamps: true
});

/**
 * Settings Document
 */
export interface ISetting extends Document {
	readonly _id: number;
	readonly storeName: string;
	readonly address: string;
	readonly email: string;
	readonly phoneNumber: string;
	readonly deliveryCharges: number;
	readonly minimumForFree: number;
	readonly taxType: string;
	readonly currency: CurrencyAdmin;
	readonly tax: TaxAdmin;
	readonly location: MapLocation;
}