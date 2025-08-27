import {
	Controller,
	Delete,
	Get,
	NotFoundException,
	Param,
	Query,
	UseGuards
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IOrder } from 'src/shared/models';
import { GetUser, LocaleService, PaymentService, PushService } from 'src/shared/services';
import {
	Message,
	Order,
	OrderDetail,
	OrderStatus,
	PaymentStatus,
	PaymentType,
	User
} from 'src/shared/classes';
import {
	getDate,
	getDeliveryDate,
	getDeliveryTime,
	validateCustomerRole
} from 'src/shared/util';
import { OrderService } from './order.service';
import { ProfileService } from 'src/profile/profile.service';
import { WalletCancelBy } from 'src/shared/classes/wallet/wallet.dto';

@Controller('/orders')
@UseGuards(AuthGuard('jwt'))
export class OrderController {

	/**
	 * Constructor
	 * @param orderService
	 * @param localeService
	 */
	constructor(
		private readonly orderService: OrderService,
		private readonly localeService: LocaleService,
		private readonly pushService: PushService,
		private readonly paymentService: PaymentService,
		private readonly profileService: ProfileService,
	) {
	}

	@Get("/")
	async getAll(@GetUser() user: User): Promise<Order[]> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();
		const data = await this.orderService.getMyOrders(user._id);

		const orders: Order[] = [];
		data.forEach((d: IOrder) => {
			const o: Order = {
				_id: d._id,
				createdAt: getDate(d.createdAt),
				updatedAt: getDate(d.updatedAt),
				payTotal: d.payTotal,
				grandTotal: d.grandTotal,
				currency: d.currency,
				method: d.method,
				deliveryDate: getDeliveryDate(d.slot.date),
				deliveryTime: getDeliveryTime(d.slot.startTime) + ' - ' + getDeliveryTime(d.slot.endTime),
				status: d.status,
			}
			orders.push(o);
		})
		return orders;
	}

	@Get("/payment-status/:paymentId")
	async paymentStatus(@GetUser() user: User, @Param("paymentId") paymentId: string): Promise<any> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();
		const order = await this.orderService.getOrderByPayment(user._id, paymentId);
		if (!order) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		if (order.isWeb) {
			const payment = await this.paymentService.retriveSession(order.paymentId);
			if (!payment) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
			await this.orderService.updateWebPayment(order._id, payment);
			if (payment['payment_status'] == 'paid') return { status: true, id: order._id };
			else {
				await this.orderService.convertToCOD(order._id);
				return { status: false, id: order._id };
			}
		} else {
			const paymentId = order.paymentId.split('_secret');
			const payment = await this.paymentService.getStatus(paymentId[0]);
			if (!payment) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
			await this.orderService.updateMobilePayment(order._id, payment);
			if (payment['status'] == 'succeeded') return { status: true, id: order._id };
			else {
				await this.orderService.convertToCOD(order._id);
				return { status: false, id: order._id };
			}
		}
	}

	@Get("/:orderId")
	async getDetail(@GetUser() user: User, @Param("orderId") orderId: number): Promise<OrderDetail> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		const orders = await Promise.all([
			this.orderService.getDetailForUser(user._id, orderId),
			this.orderService.getOrderProducts(orderId)
		]);

		if (!orders[0])
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const data = orders[0].toObject();
		const order: OrderDetail = {
			...data,
			deliveryDate: getDeliveryDate(data.slot.date),
			deliveryTime: getDeliveryTime(data.slot.startTime) + ' - ' + getDeliveryTime(data.slot.endTime),
			createdAt: getDate(data.createdAt),
			updatedAt: getDate(data.updatedAt),
			products: orders[1],
		}
		return order;
	}

	@Delete("/:orderId/cancel")
	async cancelOrder(@GetUser() user: User, @Param("orderId") orderId: number): Promise<Message> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();
		const data = await this.orderService.getDetailForUser(user._id, orderId);
		if (!data)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		if (data.status == OrderStatus.DELIVERED || data.status == OrderStatus.CANCELLED)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const order = await this.orderService.cancelByUser(user._id, orderId);
		if (order.modifiedCount != 1)
			throw new NotFoundException(this.localeService.get('MSG_UPDATE_FAILURE'));

		if (user.playerId) this.pushService.sendToCustomer(
			this.localeService.get('MSG_CUSTOMER_ORDER_CANCELLED_TITLE'),
			this.localeService.get('MSG_CUSTOMER_ORDER_CANCELLED_DESC', { orderId: data._id.toString() }),
			user.playerId
		);

		// Wallet logic
		let walletAmount = 0;
		if (data.method == PaymentType.COD)
			walletAmount = data.walletAmount;
		else if (data.method == PaymentType.CARD && data.paymentStatus == PaymentStatus.SUCCESS) {
			walletAmount = data.walletAmount + data.payTotal;
		}

		if (walletAmount > 0) {
			this.profileService.debitToWallet({
				user: user._id,
				order: data._id,
				amount: walletAmount,
				cancelBy: WalletCancelBy.CUSTOMER
			});
		}

		return { message: this.localeService.get('MSG_ORDER_CANCELLED', { orderId: data._id.toString() }) } as Message;
	}

	@Get("/convert-cod/:paymentId")
	async makeCOD(@GetUser() user: User, @Param("paymentId") paymentId: string): Promise<any> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();
		const order = await this.orderService.getOrderByPayment(user._id, paymentId);
		if (!order) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		await this.orderService.convertToCOD(order._id);
		return { status: true };
	}
}
