import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from 'mongoose';
import {
	DeleteResult,
	OrderAdminSearch,
	OrderAssignPayload,
	OrderReport,
	OrderStatus,
	OrderStatusPayload,
	PaymentStatus,
	PaymentType
} from 'src/shared/classes';
import { IOrder, IOrderProduct } from 'src/shared/models';
import { Roles, validateLimitQuery, validatePageQuery, validateSortOrder } from 'src/shared/util';

/**
 * Order Service
 */
@Injectable()
export class OrderAdminService {
	/**
   * Constructor
	 * @param orderModel
	 * @param orderProductModel
   */
  constructor(
		@InjectModel("Order") private readonly orderModel: Model<IOrder>,
		@InjectModel("OrderProduct") private readonly orderProductModel: Model<IOrderProduct>,
	) {}

  /**
	* Get all orders
	* @param payload
	* @return IOrder - List of order
	*/
	getAll(payload: OrderAdminSearch): Promise<IOrder[]> {
		const skip = payload.page * payload.limit;
		let filter = {};
		if (payload.id) {
			if(isNaN(+payload.id)) {
				filter['$or'] = [
					{ 'user.firstName': { $regex: payload.id, $options: 'i' } },
					{ 'user.lastName': { $regex: payload.id, $options: 'i' } },
					{ 'user.email': { $regex: payload.id, $options: 'i' } },
				]
			} else {
				filter['$or'] = [
					{ id: +payload.id },
					{ 'user.mobileNumber': +payload.id }
				]
			}
		}
		if (payload.status) filter['status'] = payload.status;
		if (payload.method) filter['method'] = payload.method;
		let sort = {};
		sort[payload.sortBy] = payload.orderBy;

		return this.orderModel.find(filter, 'grandTotal payTotal count status slot createdAt isAssigned method currency').skip(skip).limit(payload.limit).sort(sort).exec();
	}

	/**
	* Count all order
	* @param payload
	* @return Number - Count of order
	*/
	countAll(payload: OrderAdminSearch): Promise<number> {
		let filter = {};
		if (payload.id) {
			if(isNaN(+payload.id)) {
				filter['$or'] = [
					{ 'user.firstName': { $regex: payload.id, $options: 'i' } },
					{ 'user.lastName': { $regex: payload.id, $options: 'i' } },
					{ 'user.email': { $regex: payload.id, $options: 'i' } },
				]
			} else {
				filter['$or'] = [
					{ id: +payload.id },
					{ 'user.mobileNumber': +payload.id }
				]
			}
		}
		if (payload.status) filter['status'] = payload.status;
		if (payload.method) filter['method'] = payload.method;
		return this.orderModel.countDocuments(filter).exec();
	}

	/**
	* Get all orders by user
	* @param userId
	* @param payload
	* @return IOrder - List of order
	*/
	getAllByUser(userId: number, payload: OrderAdminSearch): Promise<IOrder[]> {
		const skip = payload.page * payload.limit;
		let filter = { 'user._id': userId };
		return this.orderModel.find(filter, 'grandTotal payTotal count status slot createdAt method currency').skip(skip).limit(payload.limit).sort({ _id: 1 }).exec();
	}

	/**
	* Count all orders by user
	* @param userId
	* @param payload
	* @return IOrder - List of order
	*/
	countAllByUser(userId: number): Promise<number> {
		let filter = { 'user._id': userId };
		return this.orderModel.countDocuments(filter).exec();
	}

	/**
	* Get all orders by delivery
	* @param userId
	* @param payload
	* @return IOrder - List of order
	*/
	getAllByDelivery(userId: number, payload: OrderAdminSearch): Promise<IOrder[]> {
		const skip = payload.page * payload.limit;
		let filter = { 'deliveryAssign._id': userId };
		return this.orderModel.find(filter, 'grandTotal payTotal count status slot createdAt method currency').skip(skip).limit(payload.limit).sort({ _id: 1 }).exec();
	}

	/**
	* Count all orders by delivery
	* @param userId
	* @param payload
	* @return IOrder - List of order
	*/
	countAllByDelivery(userId: number): Promise<number> {
		let filter = { 'deliveryAssign._id': userId };
		return this.orderModel.countDocuments(filter).exec();
	}

	/**
	* Get order detail by order id
	* @param orderId
	* @return IOrder - order detail
	*/
	getById(orderId: number): Promise<IOrder> {
		return this.orderModel.findOne({ _id: orderId }, '-__v -payment').exec();
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
	* Update order by order id
	* @param orderId
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	updateAssign(orderId: number, payload: OrderAssignPayload): Promise<UpdateWriteOpResult> {
		return this.orderModel.updateOne({ _id: orderId }, { deliveryAssign: payload, isAssigned: true }).exec();
	}

	/**
	* Delete order by order id
	* @param orderId
	* @return DeleteResult - delete document
	*/
	delete(orderId: number): Promise<DeleteResult> {
		return this.orderModel.deleteOne({ _id: orderId }).exec();
	}

	/**
	 * Cancel order Products
	 * @param orderId
	 * @returns UpdateWriteOpResult
	 */
	cancelOrderProduct(orderId: number): Promise<UpdateWriteOpResult>  {
		return this.orderProductModel.updateMany({ orderId: orderId }, { isCancelled: true }).exec();
	}

	/**
	 * Get order products
	 * @param orderId
	 * @returns
	 */
	getOrderProducts(orderId: number): Promise<IOrderProduct[]> {
		return this.orderProductModel.find({ orderId: orderId }, 'productId title thumbnail capacity sellingPrice originalPrice total quantity message eggless -_id').exec()

	}
	/**
	 * Get total order and total amount
	 * @return OrderReport
	 */
	public async getOrderAndTotal(): Promise<OrderReport> {
		const orders = await this.orderModel.aggregate([
			{ $match: { status: OrderStatus.DELIVERED } },
			{ $group: { _id: {}, data: { $sum: '$grandTotal' }, count: { $sum: 1 } } }
		]);
		let order = 0, amount = 0;
		if (orders && orders.length) {
			order = orders[0].count;
			amount = orders[0].data;
		}
		return { order, amount };
	}

	/**
	 * Get recent sales
	 */
	public async getLast7DaySales(): Promise<any> {
		let today = new Date();
		let recentDays = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
		const result = await this.orderModel.aggregate([
			{ $match: { status: OrderStatus.DELIVERED, updatedAt: { $gt: recentDays, $lte: today } } },
			{
				$group: {
					_id: { year: { $year: '$createdAt' }, month: { $month: '$updatedAt' }, date: { $dayOfMonth: '$updatedAt' } },
					value: { $sum: '$grandTotal' }
				}
			},
		]);
		return result;
	}

	/**
	 * Validate order query parameters
	 * @param query
	 */
    public async validateAdminQuery(query: OrderAdminSearch): Promise<OrderAdminSearch>  {
		const search: OrderAdminSearch = {};
		search.page = validatePageQuery(query.page);
		search.limit = validateLimitQuery(query.limit);
		search.orderBy = validateSortOrder(query.orderBy);

		let sortBy = 'createdAt';
		search.sortBy = sortBy;

		if (query.id) search.id = query.id;
		if (query.status) search.status = query.status;
		if (query.method) search.method = query.method;
		return search;
	}

	/**
	* Get Last 7 orders
	* @param payload
	* @return IOrder - List of order
	*/
	getLast7Orders(): Promise<IOrder[]> {
		return this.orderModel.find({ status: OrderStatus.PENDING }, 'grandTotal count slot createdAt method currency').skip(0).limit(7).sort({ createdAt: -1 }).exec();
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
}
