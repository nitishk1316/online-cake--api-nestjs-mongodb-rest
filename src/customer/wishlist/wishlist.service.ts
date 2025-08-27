import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { IWishlist } from 'src/shared/models';
import { DeleteResult } from 'src/shared/classes';
import { Model } from "mongoose";

/**
 * Wishlist Service
 */
@Injectable()
export class WishlistService {
	/**
   * Constructor
   * @param wishlistModel
   */
  constructor(
  	@InjectModel("Wishlist") private readonly wishlistModel: Model<IWishlist>
	) {}


	/**
	 * Get wishlist of user
	 * @param userId
	 * @return IWishlist - wishlist products
	 */
	getAllById(userId: number): Promise<IWishlist[]> {
		return this.wishlistModel.find({ user: userId }, 'productId -_id').exec();
	}

	/**
	 * Get wishlist of user
	 * @param userId
	 * @return IWishlist - wishlist products
	 */
	 validateInWishlist(userId: number, productId): Promise<IWishlist> {
		return this.wishlistModel.findOne({ user: userId, productId: productId }, 'productId -_id').exec();
	}

	/**
	 * Add product to wishlist
	 * @param userId
	 * @param productId
	 * @return IWishlist
	 */
	add(userId: number, productId: number): Promise<IWishlist> {
		return this.wishlistModel.create({ user: userId, productId: productId });
	}

	/**
	 * Remove product from wishlist
	 * @param userId
	 * @param productId
	 * @return UpdateWriteOpResult - update document
	 */
	remove(userId: number, productId: number): Promise<DeleteResult> {
		return this.wishlistModel.deleteOne({ user: userId, productId: productId }).exec();
	}
}