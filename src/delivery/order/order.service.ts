import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IOrder, IOrderProduct, ISequence, IUser } from 'src/shared/models';
import {
	OrderStatus,
	OrderStatusPayload
} from 'src/shared/classes';
import { Model, UpdateWriteOpResult } from 'mongoose';

@Injectable()
export class OrderService {
	/**
	 * Constructor
	 * @param orderModel
	 * @param orderProductModel
	 * @param userModel
	 */
	constructor(
		@InjectModel("Order") private readonly orderModel: Model<IOrder>,
		@InjectModel("OrderProduct") private readonly orderProductModel: Model<IOrderProduct>,
		@InjectModel("User") private readonly userModel: Model<IUser>,
	) {}

	/**
	 * Get Assigned orders
	 * @param userId
	 * @return IOrder[]
	 */
	assignedOrders(userId: number): Promise<IOrder[]> {
		let filter = { 'deliveryAssign._id': userId, status: { $in: [ OrderStatus.CONFIRMED, OrderStatus.ON_THE_WAY ] } };
		return this.orderModel.find(filter, 'grandTotal payTotal currency count status slot paymentStatus createdAt method deliveryAddress deliveryAccepted').sort({ createdAt: -1 }).exec();
	}

	/**
	 * Get Delivered orders
	 * @param userId
	 * @return IOrder[]
	 */
	deliveredOrders(userId: number): Promise<IOrder[]> {
		let filter = { 'deliveryAssign._id': userId, status: { $in: [ OrderStatus.DELIVERED, OrderStatus.CANCELLED ] } };
		return this.orderModel.find(filter, 'grandTotal payTotal currency count status createdAt updatedAt deliveryAddress').sort({ createdAt: -1 }).exec();
	}

	/**
	 * Get order Products
	 * @param orderId
	 */
	getOrderProducts(orderId: number): Promise<IOrderProduct[]> {
		return this.orderProductModel.find({ orderId: orderId }, 'title capacity quantity sellingPrice total').exec();
	}

	/**
	 * Get order detail
	 * @param userId
	 * @param orderId
	 * @return IOrder
	 */
	getDetail(userId: number, orderId: number): Promise<IOrder> {
		return this.orderModel.findOne({ _id: orderId, 'deliveryAssign._id' : userId }, 'currency count status slot createdAt updatedAt method deliveryAddress paymentStatus grandTotal payTotal user').exec();
	}

	/**
	* Update order by order id
	* @param orderId
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	updateStatus(orderId: number, payload: OrderStatusPayload): Promise<UpdateWriteOpResult> {
		return this.orderModel.updateOne({ _id: orderId }, payload).exec();
	}

	/**
	* Accept order
	* @param userId
	* @param orderId
	* @return UpdateWriteOpResult - update document
	*/
	accept(userId: number, orderId: number): Promise<UpdateWriteOpResult> {
		return this.orderModel.updateOne({ _id: orderId, 'deliveryAssign._id' : userId }, { deliveryAccepted: true }).exec();
	}

	/**
	* Reject order
	* @param userId
	* @param orderId
	* @return UpdateWriteOpResult - update document
	*/
	reject(userId: number, orderId: number): Promise<UpdateWriteOpResult> {
		return this.orderModel.updateOne({ _id: orderId, 'deliveryAssign._id' : userId }, { deliveryAccepted: false, deliveryAssign: { _id: null, name: null }, isAssigned: false }).exec();
	}

	/**
	 *Get customer playerId
	 * @param customerId
	 */
	getCustomer(customerId: number): Promise<IUser> {
		return this.userModel.findOne({ _id: customerId }, '_id playerId').exec();
	}

	/**
	 * Update delivery deliverd count
	 * @param userId
	 * @return UpdateWriteOpResult - update document
	 */
	updateDelivered(userId: number): Promise<UpdateWriteOpResult> {
		return this.userModel.updateOne({ _id: userId }, { $inc:  { orderDelivered: 1 } }).exec();
	}
}