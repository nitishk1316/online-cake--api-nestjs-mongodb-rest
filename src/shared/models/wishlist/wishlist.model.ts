import { Schema, Document } from "mongoose";

/**
 * Wishlist Schema
 */
export const WishlistSchema = new Schema({
	user: { type: Number },
	productId: { type: Number },
}, {
	timestamps: true
});

/**
 * Wishlist Document
 */
export interface IWishlist extends Document {
	readonly user: number;
	readonly productId: number;
}