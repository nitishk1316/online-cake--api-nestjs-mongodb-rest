import {
	Controller,
	Get,
	Put,
	Param,
	Body,
	UsePipes,
	ValidationPipe,
	UseGuards,
	BadRequestException,
	NotFoundException,
	Query,
	Delete
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from 'src/profile/profile.service';
import {
	Message,
	Order,
	OrderAdmin,
	OrderAdminDetail,
	OrderAdminList,
	OrderAdminSearch,
	OrderAssignPayload,
	OrderProduct,
	OrderStatus,
	OrderStatusPayload,
	PaymentStatus,
	PaymentType,
	User
} from 'src/shared/classes';
import { WalletCancelBy } from 'src/shared/classes/wallet/wallet.dto';
import { IOrder } from 'src/shared/models';
import { GetUser, LocaleService, PaymentService, PushService } from 'src/shared/services';
import { getDateTime, getDeliveryDate, getDeliveryTime, validateAdminRole } from 'src/shared/util';
import { CustomerAdminService } from '../customer/customer.service';
import { ProductAdminService } from '../product/product.service';
import { OrderAdminService } from './order.service';

/**
 * Order Admin Controller
 */
@Controller('/admin/orders')
@UseGuards(AuthGuard('jwt'))
export class OrderAdminController {
  /**
   * Constructor
   * @param orderService
	 * @param localeService
	 * @param customerService
	 * @param productService
   */
	constructor(
		private readonly orderService: OrderAdminService,
		private readonly localeService: LocaleService,
		private readonly customerService: CustomerAdminService,
		private readonly productService: ProductAdminService,
		private readonly profileService: ProfileService,
		private readonly pushService: PushService,
		private readonly paymentService: PaymentService,
	) {
	}

	/**
	 * Get all
	 * @param user
	 * @param query
	 * @returns
	 */
	@Get("/")
	async getAll(@GetUser() user: User, @Query() query: OrderAdminSearch): Promise<OrderAdminList> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const querySearch = await this.orderService.validateAdminQuery(query);
		const orderArr = await Promise.all([
			this.orderService.getAll(querySearch),
			this.orderService.countAll(querySearch)
		]);

		const orders: OrderAdmin[] = [];
		orderArr[0].forEach((d: IOrder) => {
			const o: OrderAdmin = {
				_id: d._id,
				createdAt: getDateTime(d.createdAt),
				payTotal: d.payTotal,
				grandTotal: d.grandTotal,
				currency: d.currency,
				count: d.count,
				method: d.method,
				isAssigned: d.isAssigned,
				deliveryDate: getDeliveryDate(d.slot.date),
				deliveryTime: getDeliveryTime(d.slot.startTime) + ' - ' + getDeliveryTime(d.slot.endTime),
				paymentStatus: d.paymentStatus,
				status: d.status,
			}
			orders.push(o);
		})
		return { data: orders , total: orderArr[1] };
	}

	/**
	 * Get all by customers
	 * @param user
	 * @param query
	 * @param userId
	 * @returns
	 */
	@Get("/customers/:userId")
	async getListByuser(@GetUser() user: User, @Query() query: OrderAdminSearch, @Param("userId") userId: number): Promise<OrderAdminList> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const querySearch = await this.orderService.validateAdminQuery(query);

		const orderArr = await Promise.all([
			this.orderService.getAllByUser(userId, querySearch),
			this.orderService.countAllByUser(userId)
		]);

		const orders: OrderAdmin[] = [];
		orderArr[0].forEach((d: IOrder) => {
			const o: OrderAdmin = {
				_id: d._id,
				createdAt: getDateTime(d.createdAt),
				payTotal: d.payTotal,
				grandTotal: d.grandTotal,
				currency: d.currency,
				count: d.count,
				method: d.method,
				isAssigned: d.isAssigned,
				deliveryDate: getDeliveryDate(d.slot.date),
				deliveryTime: getDeliveryTime(d.slot.startTime) + ' - ' + getDeliveryTime(d.slot.endTime),
				paymentStatus: d.paymentStatus,
				status: d.status,
			}
			orders.push(o);
		})

		return { data: orders, total: orderArr[1] };
	}

	/**
	 * Get all by delivery
	 * @param user
	 * @param query
	 * @param userId
	 * @returns
	 */
	 @Get("/delivery/:userId")
	 async getListByDelivery(@GetUser() user: User, @Query() query: OrderAdminSearch, @Param("userId") userId: number): Promise<OrderAdminList> {
		 if (!validateAdminRole(user.role)) throw new NotFoundException();

		 const querySearch = await this.orderService.validateAdminQuery(query);

		 const orderArr = await Promise.all([
			 this.orderService.getAllByDelivery(userId, querySearch),
			 this.orderService.countAllByDelivery(userId)
		 ]);
		 const orders: OrderAdmin[] = [];
		orderArr[0].forEach((d: IOrder) => {
			const o: OrderAdmin = {
				_id: d._id,
				createdAt: getDateTime(d.createdAt),
				payTotal: d.payTotal,
				grandTotal: d.grandTotal,
				currency: d.currency,
				count: d.count,
				method: d.method,
				isAssigned: d.isAssigned,
				deliveryDate: getDeliveryDate(d.slot.date),
				deliveryTime: getDeliveryTime(d.slot.startTime) + ' - ' + getDeliveryTime(d.slot.endTime),
				paymentStatus: d.paymentStatus,
				status: d.status,
			}
			orders.push(o);
		})
		 return { data: orders, total: orderArr[1] };
	 }

	/**
	 * Get by id
	 * @param user
	 * @param orderId
	 * @returns
	 */
	@Get("/:orderId")
	async getById(@GetUser() user: User, @Param("orderId") orderId: number): Promise<OrderAdminDetail> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const orders = await Promise.all([
			this.orderService.getById(orderId),
			this.orderService.getOrderProducts(orderId)
		]);

		if (!orders[0])
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const orderInfo: OrderAdminDetail = {
			...orders[0].toObject(),
			deliveryDate: getDeliveryDate(orders[0].slot.date),
			deliveryTime: getDeliveryTime(orders[0].slot.startTime) + ' - ' + getDeliveryTime(orders[0].slot.endTime),
			products: orders[1]
		};
		return orderInfo;
	}

	/**
	 * Update status
	 * @param user
	 * @param orderId
	 * @param payload
	 * @returns
	 */
	@Put("/:orderId/status")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async updateStatus(@GetUser() user: User, @Param('orderId') orderId: number, @Body() payload: OrderStatusPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const orderInfo = await this.orderService.getById(orderId);
		if (!orderInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const updateStatus = await this.orderService.updateStatus(orderId, payload);
		if (updateStatus.modifiedCount == 1) {
			const userInfo = await this.customerService.getById(orderInfo.user._id);
			if (payload.status == OrderStatus.CANCELLED) {

				this.customerService.updateCancelPurchased(orderInfo.user._id);
				this.orderService.cancelOrderProduct(orderInfo._id);
				const products = await this.orderService.getOrderProducts(orderInfo._id);
				products.forEach((p: OrderProduct) => {
			 		this.productService.incrementStock(p.productId, p.quantity);
				});

				let walletAmount = 0;
				if (orderInfo.method == PaymentType.COD) walletAmount = orderInfo.walletAmount;
				else if (orderInfo.method == PaymentType.CARD) {
					walletAmount = orderInfo.walletAmount + orderInfo.payTotal
				}

				if (walletAmount > 0) {
					this.profileService.debitToWallet({
						user: orderInfo.user._id,
						order: orderInfo._id,
						amount: walletAmount,
						cancelBy: WalletCancelBy.ADMIN
					});
				}

				if (userInfo.playerId) this.pushService.sendToCustomer(
					this.localeService.get('MSG_CUSTOMER_ORDER_CANCELLED_TITLE'),
					this.localeService.get('MSG_CUSTOMER_ORDER_CANCELLED_DESC', { orderId: orderId.toString() }),
					userInfo.playerId
				);

			} else if (payload.status == OrderStatus.DELIVERED) {
				if (userInfo.playerId) this.pushService.sendToCustomer(
					this.localeService.get('MSG_CUSTOMER_ORDER_DELIVERED_TITLE'),
					this.localeService.get('MSG_CUSTOMER_ORDER_DELIVERED_DESC', { orderId: orderId.toString() }),
					userInfo.playerId
				);
			} else if (payload.status == OrderStatus.ON_THE_WAY) {
				if (userInfo.playerId) this.pushService.sendToCustomer(
					this.localeService.get('MSG_CUSTOMER_ORDER_ON_THE_WAY_TITLE'),
					this.localeService.get('MSG_CUSTOMER_ORDER_ON_THE_WAY_DESC', { orderId: orderId.toString() }),
					userInfo.playerId
				);
			} else if (payload.status == OrderStatus.CONFIRMED) {
				if (userInfo.playerId) this.pushService.sendToCustomer(
					this.localeService.get('MSG_CUSTOMER_NOTIFY_ORDER_CONFIRMED_TITLE'),
					this.localeService.get('MSG_CUSTOMER_NOTIFY_ORDER_CONFIRMED_DESC', { orderId: orderId.toString() }),
					userInfo.playerId
				);
			}
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		}
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Update assign
	 * @param user
	 * @param orderId
	 * @param payload
	 * @returns
	 */
	@Put("/:orderId/assign")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async orderAssign(@GetUser() user: User, @Param('orderId') orderId: number, @Body() payload: OrderAssignPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const orderInfo = await this.orderService.getById(orderId);
		if (!orderInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const deliveryInfo = await this.customerService.getById(payload._id);
		if (!deliveryInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		payload.name = deliveryInfo.firstName + ' ' + deliveryInfo.lastName;
		const updateAssign = await this.orderService.updateAssign(orderId, payload);
		if (updateAssign.modifiedCount == 1) {
			if (deliveryInfo.playerId) this.pushService.sendToDelivery(
				this.localeService.get('MSG_DELIVERY_NOTIFY_ORDER_ASSIGNED_TITLE'),
				this.localeService.get('MSG_DELIVERY_NOTIFY_ORDER_ASSIGNED_DESC', { orderId: orderId.toString() }),
				deliveryInfo.playerId
			);
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		}
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Delete order
	 * @param user
	 * @param orderId
	 * @returns
	 */
	@Delete("/:orderId")
	private async delete(@GetUser() user: User, @Param("orderId") orderId: number): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const orderInfo = await this.orderService.getById(orderId);
		if (!orderInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		if (orderInfo.status != OrderStatus.PENDING)
			throw new BadRequestException(this.localeService.get('MSG_ORDER_CANNOT_DELETE'));

		const coupon = await this.orderService.delete(orderId);
		if (coupon.deletedCount == 1)
			return { message: this.localeService.get('MSG_DELETE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_DELETE_FAILURE'));
	}

	@Get("/:orderId/verify-payment")
	async paymentStatus(@GetUser() user: User, @Param("orderId") orderId: number): Promise<any> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		const order = await this.orderService.getById(orderId);
		if (!order) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		if (order.isWeb) {
			const payment = await this.paymentService.retriveSession(order.paymentId);
			if (!payment) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
			await this.orderService.updateWebPayment(order._id, payment);
			return { status: true};
		}
		else {
			const paymentId = order.paymentId.split('_secret');
			const payment = await this.paymentService.getStatus(paymentId[0]);
			if (!payment) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
			await this.orderService.updateMobilePayment(order._id, payment);
			return { status: true };
		}
	}

	@Get("/:orderId/convert-to-cod")
	async makeCOD(@GetUser() user: User, @Param("orderId") orderId: number): Promise<any> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();
		const order = await this.orderService.getById(orderId);
		if (!order)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		if (order.method == PaymentType.COD)
			throw new NotFoundException(this.localeService.get('MSG_ORDER_ALREADY_COD'));

		if (order.method == PaymentType.CARD) {
			if (order.paymentStatus == PaymentStatus.SUCCESS)
				throw new NotFoundException(this.localeService.get('MSG_ORDER_ALREADY_PAYMENT_SUCCESS'));
			else
				await this.orderService.convertToCOD(order._id);
		}
		else {
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
		}
		return { status: true };
	}
}
