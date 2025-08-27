import { IsNotEmpty, IsNumber, Min, IsOptional, MaxLength, IsBoolean } from "class-validator";
import { Currency, Tax } from "../setting/setting.dto";

/*
* Cart product payload
*/
export class CartPayload {
	@IsNotEmpty()
	_id: number;

	@IsNotEmpty()
	sku: string;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	quantity: number;

	@IsNotEmpty()
	@IsBoolean()
	eggless: boolean;
}


/*
* Cake message payload
*/
export class CakeMessagePayload {
	@IsOptional()
	@MaxLength(25)
	message?: string;
}

/**
 * Cart Count
 */
export class Cart {
	_id: number;
	count: number;
	minimumForFree: number;
	applyDeliveryCharges: number;
	products: CartProduct[];
	subTotal: number;
	payTotal: number;
	grandTotal: number;
	deliveryCharges: number;
	tax: Tax;
	taxType: string;
	currency: Currency;
	taxPrice: number;
	isWalletUsed: boolean;
	walletAmount: number;
	address: number;
	coupon: CartCoupon;
	slot: string;
	status: boolean;
	message?: string;
}

/**
 * Cart Coupon
 */
export class CartCoupon {
	code: string;
	discount: number;
}

/*
* Cart place payload
*/
export class CartPlacePayload {
	@IsNotEmpty()
	method: string;
}

export class OrderPlace {
	id?: number;
	status: boolean;
}

/**
 * Cart Product
 */
 export class CartProduct {
	_id: number;
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
	outOfStock?: boolean;
	type: number;
	flavour?: number;
	occasion?: number;
	message?: string;
	eggless?: boolean;
}