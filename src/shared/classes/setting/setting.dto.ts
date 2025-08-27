import { MapLocation } from '../common/location.dto';

/**
 * Tax Type
 */
export enum TaxType {
	INCLUDED = 'INCLUDED',
	EXCLUDED = 'EXCLUDED'
}

/**
 * Tax
 */
export class Tax {
	title: string;
	percent: number;
}

/**
 * Currency
 */
export class Currency {
	code: string;
	symbol: string;
}

/**
 * Setting
 */
export class Setting {
	storeName: string;
	address: string;
	email: string;
	phoneNumber: string;
	location: MapLocation;
	deliveryCharges: number;
	minimumForFree: number;
	taxType: string;
	tax: Tax;
	currency: Currency;
}