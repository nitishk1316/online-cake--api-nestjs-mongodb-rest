import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import { DeleteResult, Cart } from 'src/shared/classes';
import { ICart, ICoupon, ISequence } from 'src/shared/models';

@Injectable()
export class CartService {
	/**
	 * Constructor
	 * @param cartModel
	 * @param couponModel
	 * @param sequenceModel
	 */
	constructor(
		@InjectModel("Cart") private readonly cartModel: Model<ICart>,
		@InjectModel("Coupon") private readonly couponModel: Model<ICoupon>,
		@InjectModel("Sequence") private readonly sequenceModel: Model<ISequence>,
	) {}

	/**
	 * Get By anonymousId
	 * @param anonymousId
	 * @returns
	 */
	getByAnonymousId(anonymousId: string): Promise<ICart> {
		return this.cartModel.findOne({ anonymousId: anonymousId, user: null }, '-createdAt -updatedAt -__v -user').exec();
	}

	/**
	 * Get by user
	 * @param userId
	 * @returns
	 */
	getByUser(userId: number): Promise<ICart> {
		return this.cartModel.findOne({ user: userId }, '-createdAt -updatedAt -__v -user').exec();
	}

	/**
	 * Create Default cart
	 * @param userId
	 * @param anonymousId
	 * @returns
	 */
	async create(userId: number, anonymousId: string) {
		const data = {};
		const count = await this._getCartId();

		data['_id'] = count.value;
		data['user'] = userId;
		data['anonymousId'] = anonymousId;
		return this.cartModel.create(data);
	}

	/**
	 * Update cart by cart id
	 * @param cartId
	 * @param payload
	 * @return UpdateWriteOpResult - update document
	 */
	update(cartId: number, payload: Cart): Promise<UpdateWriteOpResult> {
		return this.cartModel.updateOne({ _id: cartId }, payload).exec();
	}

	/**
	 * Update cart address
	 * @param cartId
	 * @param addressId
	 * @return UpdateWriteOpResult - update document
	 */
	updateAddress(cartId: number, addressId: number): Promise<UpdateWriteOpResult> {
		return this.cartModel.updateOne({ _id: cartId }, { address: addressId }).exec();
	}

	/**
	 * Get cart Id
	 * @returns
	 */
	private _getCartId(): Promise<ISequence> {
		return this.sequenceModel.findOneAndUpdate({ "_id": "CART" }, { $inc: { "value": 1 } }, { new: true }).exec();
	}

	/**
	* Get coupon by coupon code
	* @param code
	* @return ICoupon - coupon detail
	*/
	getCouponByCode(code: string): Promise<ICoupon> {
		return this.couponModel.findOne({ code: code }).exec();
	}

	/**
	 * Delete Cart by anonymousId
	 * @param anonymousId
	 * @returns
	 */
	deleteCartByAnonymousId(anonymousId: string): Promise<DeleteResult> {
		return this.cartModel.deleteOne({ anonymousId: anonymousId }).exec();
	}

	/**
	 * Update cart slot
	 * @param cartId
	 * @param key
	 * @return UpdateWriteOpResult - update document
	 */
	updateSlot(cartId: number, key: string): Promise<UpdateWriteOpResult> {
		return this.cartModel.updateOne({ _id: cartId }, { slot: key }).exec();
	}

	/**
	 * Delete cart by cart id
	 * @param cartId
	 * @return DeleteResult - delete document
	 */
	delete(cartId: number): Promise<DeleteResult> {
		return this.cartModel.deleteOne({ _id: cartId }).exec();
	}

	/**
	 * Update message
	 * @param cartId
	 * @param sku
	 * @param message
	 * @return UpdateWriteOpResult - update document
	 */
	updateMessage(cartId: number, sku: string, message: string): Promise<UpdateWriteOpResult> {
		let filter = { _id: cartId, "products.sku": sku };
		return this.cartModel.updateOne(filter, { $set: { "products.$.message": message }}).exec();
	}
}
