import { IsNotEmpty, IsNumber } from "class-validator";
import { Address } from "../address/address.dto";
import { TaxAdmin } from "../setting/setting-admin.dto";
import { CartCoupon } from "../cart/cart.dto";
import { Currency, Tax } from "../setting/setting.dto";
import { User } from "../customer/customer.dto";

/**
 * Order Status
 */
export enum OrderStatus {
	PENDING = 'PENDING',
	CONFIRMED = 'CONFIRMED',
	ON_THE_WAY = 'ON_THE_WAY',
	DELIVERED = 'DELIVERED',
	CANCELLED = 'CANCELLED'
}

/**
 * Payment Status
 */
export enum PaymentStatus {
	PENDING = 'PENDING',
	SUCCESS = 'SUCCESS',
	FAILED = 'FAILED',
}

/**
 * Order Product
 */
export class OrderProduct {
	orderId?: number;
	productId: number;
	title: string;
	slug: string;
	thumbnail: string;
	sku: string;
	capacity: string;
	sellingPrice: number;
	originalPrice: number;
	discount?: number;
	quantity: number;
	total: number;
	type: number;
	flavour?: number;
	occasion?: number;
	isCancelled?: boolean;
}

/**
 * Slot
 */
 export class OrderSlot {
	key: string;
	date: Date;
	startTime?: Date;
	endTime?: Date;
}

export class PaymentPayload {
	method: string;
	id?: string;
}

/**
 * Payment Payload
 */
 export class OrderPaymentPayload {
	amount: number;
	currency: string;
	description?: string;
}

export class OrderPaymentStatus {
	status: boolean;
	intent?: OrderPayment;
	message?: string;
}

export class LastPaymentError {
	message?: string;
	code?: string;
	decline_code?: string;
}
/**
 * Order Payment
 */
export class OrderPayment {
	id: string;
	client_secret: string;
	status: string;
	capture_method: string;
	currency: string;
	amount: number;
	last_payment_error: LastPaymentError;
}

/**
 * Order Delivery
 */
 export class OrderAssign {
	name: string;
	_id: number;
}

/**
 * Order
 */
export class Order {
	_id: number;
	createdAt: string;
	updatedAt: string;
	payTotal: number;
	grandTotal: number;
	currency: Currency;
	method: string;
	deliveryDate: string;
	deliveryTime: string;
	status: string;
}

/**
 * Order Detail
 */
export class OrderDetail extends Order {
	products: OrderProduct[];
	deliveryAddress: Address;
	subTotal: number;
	deliveryCharges: number;
	tax: Tax;
	taxType: string;
	currency: Currency;
	taxPrice: number;
	coupon: CartCoupon;
	updatedAt: string;
}

/**
 * Order Delivery
 */
 export class OrderAssignPayload {
	@IsNotEmpty()
	name: string;

	@IsNotEmpty()
	_id: number;
}

/**
 * Order Payload
 */
export class OrderPayload {
	_id: number;
	user: User;
	deliveryAddress: Address;
	tax: TaxAdmin;
	taxType: string;
	subTotal: number;
	grandTotal: number;
	payTotal: number;
	deliveryCharges: number;
	count: number;
	method: string;
	slot: OrderSlot;
	currency: Currency;
	paymentStatus: string;
	coupon?: CartCoupon;
	status: string;
	payment?: OrderPayment;
	isWalletUsed: boolean;
	walletAmount: number;
}