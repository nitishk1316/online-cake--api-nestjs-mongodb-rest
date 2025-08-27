import { Schema, Document } from "mongoose";

/**
 * Wallet Schema
 */
export const WalletSchema = new Schema({
	user: { type: Number },
	order: { type: Number },
	amount: { type: Number },
	walletType: { type: String },
	cancelBy: { type: String },
}, {
	timestamps: true
});

/**
 * Wallet Document
 */
export interface IWallet extends Document {
	readonly user: number;
	readonly order: number;
	readonly amount: number;
	readonly walletType: string;
	readonly cancelBy: string;
	readonly createdAt: string;
}