import {
	IsNotEmpty,
	IsEnum,
	IsNumber,
	Min,
	IsString
} from "class-validator";
import { CouponType } from "./coupon.dto";

/**
 * Coupon Payload
 */
export class CouponAdminPayload {
	@IsNotEmpty()
	code: string;

	@IsNotEmpty()
	@IsEnum(CouponType, { message: 'Coupon type must be one of these ' + Object.keys(CouponType) })
	couponType: string;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	discount: number;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	minAmount: number;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	maxDiscount: number;

	@IsString()
	startDate: Date;

	@IsString()
	endDate: Date;

	@IsNumber()
	type: number;
}

/**
 * Coupon
 */
export class CouponAdmin {
	_id: number;
	code: string;
	couponType: string;
	discount: number;
	minAmount: number;
	maxDiscount: number;
	startDate: Date;
	endDate: Date;
	type: number;
	active: boolean;
}

/**
 * Coupon List
 */
export class CouponAdminList {
	data: CouponAdmin[];
	total: number;
}

/**
 * Coupon search
 */
export class CouponAdminSearch {
	page?: number;
	limit?: number;
	title?: string;
	couponType?: string;
	type?: number;
	sortBy?: string;
	orderBy?: number;
}