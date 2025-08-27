import {
	IsNotEmpty,
	ValidateNested,
	IsEnum,
	IsString,
	Length,
} from "class-validator";
import { Type } from 'class-transformer';
import { MapLocation } from '../common/location.dto';

/**
 * Address Type
 */
export enum AddressType {
	HOME = 'HOME',
	WORK = 'WORK',
	OTHER = 'OTHER'
}

/**
 * Address Payload
 */
export class AddressPayload {
	@IsNotEmpty()
	name: string;

	@IsNotEmpty()
	address: string;

	@IsNotEmpty()
	flat: string;

	@IsNotEmpty()
	street: string;

	@IsNotEmpty()
	@Length(7, 15)
	mobileNumber: string;

	@IsNotEmpty()
	@IsString()
	@IsEnum(AddressType, { message: 'addressType must be one of these ' + Object.keys(AddressType) })
	addressType: string;

	@ValidateNested()
	@Type(() => MapLocation)
	location: MapLocation;

	@IsNotEmpty()
	country: string;
}

/**
 * Address
 */
export class Address {
	_id: number;
	name: string;
	address: string;
	flat: string;
	street: string;
	mobileNumber: string;
	addressType: string;
	location: MapLocation;
	country: string;
}