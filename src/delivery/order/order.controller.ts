import {
	BadRequestException,
	Body,
	Controller,
	Get,
	NotFoundException,
	Param,
	Put,
	UseGuards,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IOrder } from 'src/shared/models';
import { GetUser, LocaleService, PushService } from 'src/shared/services';
import {
	Message,
	OrderDelivery,
	OrderDetail,
	OrderStatus,
	OrderStatusPayload,
	User
} from 'src/shared/classes';
import {
	getDateTime,
	getDeliveryDate,
	getDeliveryTime,
	validateDeliveryRole
} from 'src/shared/util';
import { OrderService } from './order.service';

@Controller('/delivery/orders')
@UseGuards(AuthGuard('jwt'))
export class OrderController {

	/**
	 * Constructor
	 * @param orderService
	 * @param localeService
	 * @param pushService
	 */
	constructor(
		private readonly orderService: OrderService,
		private readonly localeService: LocaleService,
		private readonly pushService: PushService,
	) {
	}

	@Get("/")
	async getAll(@GetUser() user: User): Promise<OrderDelivery[]> {
		if (!validateDeliveryRole(user.role)) throw new NotFoundException();
		const data = await this.orderService.assignedOrders(user._id);

		const orders: OrderDelivery[] = [];
		data.forEach((d: IOrder) => {
			const o: OrderDelivery = {
				_id: d._id,
				createdAt: getDateTime(d.createdAt),
				payTotal: d.payTotal,
				grandTotal: d.grandTotal,
				currency: d.currency,
				deliveryAddress: d.deliveryAddress,
				count: d.count,
				method: d.method,
				deliveryDate: getDeliveryDate(d.slot.date),
				deliveryTime: getDeliveryTime(d.slot.startTime) + ' - ' + getDeliveryTime(d.slot.endTime),
				paymentStatus: d.paymentStatus,
				deliveryAccepted: d.deliveryAccepted,
				status: d.status,
			}
			orders.push(o);
		})
		return orders;
	}

	@Get("/delivered")
	async getAllDelivered(@GetUser() user: User): Promise<OrderDelivery[]> {
		if (!validateDeliveryRole(user.role)) throw new NotFoundException();
		const data = await this.orderService.deliveredOrders(user._id);

		const orders: OrderDelivery[] = [];
		data.forEach((d: IOrder) => {
			const o: OrderDelivery = {
				_id: d._id,
				updatedAt: getDateTime(d.updatedAt),
				createdAt: getDateTime(d.createdAt),
				payTotal: d.payTotal,
				grandTotal: d.grandTotal,
				currency: d.currency,
				count: d.count,
				method: d.method,
				deliveryAddress: d.deliveryAddress,
				paymentStatus: d.paymentStatus,
				status: d.status,
			}
			orders.push(o);
		})
		return orders;
	}

	@Get("/:orderId")
	async getDetail(@GetUser() user: User, @Param("orderId") orderId: number): Promise<OrderDetail> {
		if (!validateDeliveryRole(user.role)) throw new NotFoundException();

		const orders = await Promise.all([
			this.orderService.getDetail(user._id, orderId),
			this.orderService.getOrderProducts(orderId)
		]);

		if (!orders[0])
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const data = orders[0].toObject();
		const order: OrderDetail = {
			...data,
			deliveryDate: getDeliveryDate(data.slot.date),
			deliveryTime: getDeliveryTime(data.slot.startTime) + ' - ' + getDeliveryTime(data.slot.endTime),
			createdAt: getDateTime(data.createdAt),
			updatedAt: getDateTime(data.updatedAt),
			products: orders[1],
		}
		return order;
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
		if (!validateDeliveryRole(user.role)) throw new NotFoundException();

		const orderInfo = await this.orderService.getDetail(user._id, orderId);
		if (!orderInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
		if (payload.status == OrderStatus.ON_THE_WAY || payload.status == OrderStatus.DELIVERED) {
			const updateStatus = await this.orderService.updateStatus(orderId, payload);
			if (updateStatus.modifiedCount == 1) {
				const userInfo = await this.orderService.getCustomer(orderInfo.user._id);
				if (payload.status == OrderStatus.ON_THE_WAY) {
					if (userInfo && userInfo.playerId) {
						this.pushService.sendToCustomer(
							this.localeService.get('MSG_CUSTOMER_ORDER_ON_THE_WAY_TITLE'),
							this.localeService.get('MSG_CUSTOMER_ORDER_ON_THE_WAY_DESC', { orderId: orderId.toString() }),
							userInfo.playerId
						);
					}
				} else if (payload.status == OrderStatus.DELIVERED) {
					if (userInfo && userInfo.playerId) {
						this.pushService.sendToCustomer(
							this.localeService.get('MSG_CUSTOMER_ORDER_DELIVERED_TITLE'),
							this.localeService.get('MSG_CUSTOMER_ORDER_DELIVERED_DESC', { orderId: orderId.toString() }),
							userInfo.playerId
						);
					}
					this.orderService.updateDelivered(user._id);
				}
				return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
			}
			else
				throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
		}
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Accept
	 * @param user
	 * @param orderId
	 * @returns
	 */
	@Put("/:orderId/accept")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async accept(@GetUser() user: User, @Param('orderId') orderId: number): Promise<Message> {
		if (!validateDeliveryRole(user.role)) throw new NotFoundException();

		const orderInfo = await this.orderService.getDetail(user._id, orderId);
		if (!orderInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const updateStatus = await this.orderService.accept(user._id, orderId);
		if (updateStatus.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Reject
	 * @param user
	 * @param orderId
	 * @returns
	 */
	@Put("/:orderId/reject")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async reject(@GetUser() user: User, @Param('orderId') orderId: number): Promise<Message> {
		if (!validateDeliveryRole(user.role)) throw new NotFoundException();

		const orderInfo = await this.orderService.getDetail(user._id, orderId);
		if (!orderInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const updateStatus = await this.orderService.reject(user._id, orderId);
		if (updateStatus.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}
}
