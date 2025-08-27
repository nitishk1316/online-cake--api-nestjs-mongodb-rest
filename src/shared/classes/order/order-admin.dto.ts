import { IsOptional, IsEnum } from "class-validator";
import { Address } from "../address/address.dto";
import { Customer, User } from "../customer/customer.dto";
import { Currency } from "../setting/setting.dto";
import { OrderProduct, OrderSlot, OrderStatus, OrderAssign } from "./order.dto";

/**
 * Order Status Payload
 */
export class OrderStatusPayload {
	@IsOptional()
	@IsEnum(OrderStatus, { message: 'status must be one of these ' + Object.keys(OrderStatus) })
	status: string;
}

/**
 * Order
 */
export class OrderAdmin {
	_id: number;
	createdAt: string;
	grandTotal: number;
	payTotal: number;
	count: number;
	method: string;
	deliveryDate: string;
	deliveryTime: string;
	status: string;
	currency: Currency;
	isAssigned: boolean;
	paymentStatus: string;
}

/**
 * Order Detail
 */
export class OrderAdminDetail extends OrderAdmin {
	deliveryAddress: Address;
	products: OrderProduct[];
	user: Customer;
	deliveryAssign?: OrderAssign;
}

/**
 * Order List
 */
export class OrderAdminList {
	data: OrderAdmin[];
	total: number;
}
/**
 * Order Report
 */
export class OrderReport {
	amount: number;
	order: number;
}

/**
 * Order Search
 */
export class OrderAdminSearch {
	page?: number;
	limit?: number;
	id?: string;
	status?: string;
	method?: string;
	sortBy?: string;
	orderBy?: number;
}
