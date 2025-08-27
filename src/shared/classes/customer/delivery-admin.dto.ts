import { IsNotEmpty, IsOptional, Length, MaxLength, MinLength } from "class-validator";

/**
 * Delivery
 */
export class DeliveryAdmin {
	firstName: string;
	lastName: string;
	email: string;
	mobileNumber: string;
	active: boolean;
	orderDelivered: number;
	createdAt?: string;
}

/**
 * Delivery Payload
 */
 export class DeliveryPayload {
	@IsNotEmpty()
	firstName: string;

	@IsNotEmpty()
	lastName: string;

	@IsOptional()
	email: string;

	@IsNotEmpty()
	@Length(8, 35)
	password: string;

	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(12)
	mobileNumber: string;
}

/**
 * Delivery List
 */
export class DeliveryAdminList {
	data: DeliveryAdmin[];
	total: number;
}

/**
 * User Search
 */
export class DeliveryAdminSearch {
	page?: number;
	limit?: number;
	email?: string;
	sortBy?: string;
	orderBy?: number;
}