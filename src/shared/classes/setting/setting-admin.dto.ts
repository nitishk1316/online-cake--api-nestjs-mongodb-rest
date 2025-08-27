import { MapLocation } from '../common/location.dto';
import {
	IsNotEmpty,
	ValidateNested,
	Min,
	Max,
	IsString,
	IsEnum
} from "class-validator";
import { Type } from 'class-transformer';
import { TaxType } from './setting.dto';

/**
 * Store Payload
 */
export class StoreAdminPayload {
	@IsNotEmpty()
	storeName: string;

	@IsNotEmpty()
	address: string;

	@IsNotEmpty()
	email: string;

	@IsNotEmpty()
	phoneNumber: string;

	@ValidateNested()
	@Type(() => MapLocation)
	location: MapLocation;
}

/**
 * Currency Payload
 */
export class CurrencyAdminPayload {
	symbol: string;
	code: string;
}

/**
 * Tax Payload
 */
export class TaxAdminPayload {
	@IsNotEmpty()
	title: string;

	@IsNotEmpty()
	@Min(0)
	@Max(99)
	percent: number;
}

/**
 * Delivery Tax Payload
 */
export class DeliveryTaxAdminPayload {
	@IsNotEmpty()
	@Min(0)
	deliveryCharges: number;

	@IsNotEmpty()
	@Min(0)
	minimumForFree: number;

	@IsNotEmpty()
	@IsString()
	@IsEnum(TaxType, { message: 'taxType must be one of these ' + Object.keys(TaxType) })
	taxType: string;

	@ValidateNested()
	@Type(() => TaxAdminPayload)
	tax: TaxAdminPayload;
}

/**
 * Store
 */
export class StoreAdmin {
	storeName: string;
	address: string;
	email: string;
	phoneNumber: string;
	location: MapLocation;
}

/**
 * Currency
 */
export class CurrencyAdmin {
	symbol: string;
	code: string;
}

/**
 * Tax
 */
export class TaxAdmin {
	title: string;
	percent: number;
}

/**
 * Delivery Tax
 */
export class DeliveryTaxAdmin {
	deliveryCharges: number;
	minimumForFree: number;
	taxType: string;
	tax: TaxAdmin;
}
