import { IsNotEmpty, IsOptional, IsNumber, Min, IsString, IsEnum } from "class-validator";

/**
 * Deal Type
 */
export enum DealType {
	UPTO_OFF = 'UPTO_OFF',
	MIN_OFF = 'MIN_OFF',
	UNDER = 'UNDER'
}

/**
 * Deal Payload
 */
export class DealAdminPayload {
	@IsNotEmpty()
	title: string;

	@IsNotEmpty()
	image: string;

	@IsNotEmpty()
	@IsString()
	@IsEnum(DealType, { message: 'dealType must be one of these ' + Object.keys(DealType) })
	dealType: string;

	@IsNumber()
	@Min(0)
	value: number;

	@IsOptional()
	type: number;
}

/**
 * Deal
 */
export class DealAdmin  {
	_id: number;
	title: string;
	image: string;
	dealType: string;
	value: number;
	type: number;
	active: boolean;
}

/**
 * Deal List
 */
export class DealAdminList {
	data: DealAdmin[];
	total: number;
}

/**
 * Deal Search
 */
export class DealAdminSearch {
	page?: number;
	limit?: number;
	title?: string;
	dealType?: string;
	sortBy?: string;
	orderBy?: number;
}