import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IOrder, IOrderProduct, ISequence } from 'src/shared/models';
import {
	Address,
	OrderPayload,
	OrderProduct,
	OrderStatus,
	OrderSlot,
	User,
	PaymentStatus,
	OrderPayment,
	Cart,
	PaymentType
} from 'src/shared/classes';
import { Model, UpdateWriteOpResult } from 'mongoose';

@Injectable()
export class OrderService {
	/**
	 * Constructor
	 * @param orderModel
	 * @param orderProductModel
	 * @param sequenceModel
	 */
	constructor(
		@InjectModel("Order") private readonly orderModel: Model<IOrder>,
		@InjectModel("OrderProduct") private readonly orderProductModel: Model<IOrderProduct>,
		@InjectModel("Sequence") private readonly sequenceModel: Model<ISequence>
	) {}

	async create(user: User, address: Address, cart: Cart, slot: OrderSlot, method: string): Promise<{ order: IOrder, orderProducts: IOrderProduct[] }> {
		const count = await this._getOrderId();
		let payload: OrderPayload = {
			...cart,
			deliveryAddress: address,
			user: user,
			count: cart.products.length,
			method: method,
			slot: slot,
			paymentStatus: PaymentStatus.PENDING,
			status: OrderStatus.PENDING,
			isWalletUsed: cart.isWalletUsed,
			walletAmount: cart.walletAmount,
		}
		payload['_id'] = count.value;
		if (method == PaymentType.COD && cart.payTotal == 0) {
			payload.paymentStatus = PaymentStatus.SUCCESS;
		}

		const order = await this.orderModel.create(payload);
		if (order) {
			let products: OrderProduct[] = [];
			cart.products.forEach(p => {
				let orderProduct = {
					...p,
					orderId: order._id,
					productId: p._id,
				}
				delete orderProduct['_id'];
				products.push(orderProduct);
			});
			const orderProducts = await this.orderProductModel.insertMany(products) as IOrderProduct[];
			return { order, orderProducts };
		}
	}

	/**
	 * Get My orders
	 * @param userId
	 * @return IOrder[]
	 */
	getMyOrders(userId: number): Promise<IOrder[]> {
		let filter = { 'user._id': userId };
		return this.orderModel.find(filter, 'grandTotal payTotal currency status slot createdAt updatedAt method').sort({ createdAt: -1 }).exec();
	}

	/**
	 * Get order Products
	 * @param orderId
	 */
	getOrderProducts(orderId: number): Promise<IOrderProduct[]> {
		return this.orderProductModel.find({ orderId: orderId }, '-_id productId title slug thumbnail capacity quantity sellingPrice total message eggless').exec();
	}

	/**
	 * Get order detail
	 * @param userId
	 * @param orderId
	 * @return IOrder
	 */
	getDetailForUser(userId: number, orderId: number): Promise<IOrder> {
		return this.orderModel.findOne({ _id: orderId, 'user._id': userId }, 'currency count status slot createdAt method deliveryAddress coupon paymentStatus grandTotal payTotal subTotal deliveryCharges tax taxType taxPrice isWalletUsed walletAmount updatedAt').exec();
	}

	/**
	 * Canel order by user
	 * @param userId
	 * @param orderId
	 * @return UpdateWriteOpResult -update document
	 */
	cancelByUser(userId: number, orderId: number): Promise<UpdateWriteOpResult> {
		return this.orderModel.updateOne({ _id: orderId, 'user._id': userId }, { status: OrderStatus.CANCELLED }).exec();
	}

	/**
	 * Get order detail
	 * @param userId
	 * @param orderId
	 * @return IOrder
	 */
	getOrderByPayment(userId: number, paymentId: string): Promise<IOrder> {
		return this.orderModel.findOne({ paymentId: paymentId, 'user._id': userId }, 'paymentId isWeb').exec();
	}

	/**
	 * Update payment
	 * @param orderId
	 * @param payment
	 * @return UpdateWriteOpResult
	 */
	 updateWebPayment(orderId: number, payment: object): Promise<UpdateWriteOpResult> {
		let paymentStatus = PaymentStatus.PENDING;
		if (payment['payment_status'] == 'paid') paymentStatus = PaymentStatus.SUCCESS;
		else paymentStatus = PaymentStatus.FAILED;
		return this.orderModel.updateOne({ _id: orderId }, { payment: payment, paymentStatus: paymentStatus }).exec();
	}


	/**
	 * Update payment
	 * @param orderId
	 * @param payment
	 * @return UpdateWriteOpResult
	 */
	 updateMobilePayment(orderId: number, payment: object): Promise<UpdateWriteOpResult> {
		let paymentStatus = PaymentStatus.PENDING;
		if (payment['status'] == 'succeeded') paymentStatus = PaymentStatus.SUCCESS;
		else paymentStatus = PaymentStatus.FAILED;
		return this.orderModel.updateOne({ _id: orderId }, { payment: payment, paymentStatus: paymentStatus }).exec();
	}

	/**
	 * Convert to COD
	 * @param orderId
	 * @return UpdateWriteOpResult
	 */
	 convertToCOD(orderId: number): Promise<UpdateWriteOpResult> {
		return this.orderModel.updateOne({ _id: orderId }, { method: PaymentType.COD, paymentStatus: PaymentStatus.PENDING }).exec();
	}

	/**
	 * Get order Id
	 * @returns
	 */
	private _getOrderId(): Promise<ISequence> {
		return this.sequenceModel.findOneAndUpdate({ "_id": "ORDER" }, { $inc: { "value": 1 } }, { new: true }).exec();
	}

	/**
	 *
	 * @param orderId
	 * @param paymentId
	 * @param isWeb
	 * @returns
	 */
	updatePaymentId(orderId: number, paymentId: string, isWeb: boolean): Promise<UpdateWriteOpResult> {
		return this.orderModel.updateOne({ _id: orderId }, { paymentId: paymentId, isWeb: isWeb }).exec();
	}
}