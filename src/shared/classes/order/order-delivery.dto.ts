import { Address } from "../address/address.dto";
import { Currency, Tax } from "../setting/setting.dto";

/**
 * Order Product
 */
export class OrderDeliveryProduct {
	productId: number;
	title: string;
	capacity: string;
	sellingPrice: number;
	quantity: number;
	total: number;
}

/**
 * Order
 */
export class OrderDelivery {
	_id: number;
	deliveryAddress: Address;
	createdAt?: string;
	updatedAt?: string;
	grandTotal: number;
	payTotal: number;
	count: number;
	currency: Currency;
	method?: string;
	deliveryDate?: string;
	deliveryTime?: string;
	status: string;
	deliveryAccepted?: boolean;
	paymentStatus?: string;
}

/**
 * Order Detail
 */
export class OrderDeliveryDetail extends OrderDelivery {
	products: OrderDeliveryProduct[];
}