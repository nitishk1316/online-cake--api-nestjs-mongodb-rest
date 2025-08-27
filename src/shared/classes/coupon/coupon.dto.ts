/**
 * Coupon Type
 */
export enum CouponType {
	AMOUNT = 'AMOUNT',
	PERCENTAGE = 'PERCENTAGE'
}

/**
 * Coupon
 */
export class Coupon {
	code: string;
	couponType: string;
	discount: number;
	minAmount: number;
	maxDiscount: number;
	startDate: Date;
	endDate: Date;
	type: number;
}