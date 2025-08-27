import {
	ValidateNested,
	IsNumber,
	IsBoolean,
	Min,
	ArrayMinSize,
} from "class-validator";
import { Type } from 'class-transformer';

/**
 * Timing Payload
 */
export class TimingPayload {
	@IsNumber()
	@Min(0)
	open: number;

	@IsNumber()
	@Min(0)
	close: number;

	@IsBoolean()
	isOpen: boolean;

	key: string;
	time: string;
}

/**
 * Slot Payload
 */
export class SlotPayload {
	@IsBoolean()
	isOpen: boolean;

	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => TimingPayload)
	timings: TimingPayload[];
}

/**
 * Timing
 */
export class TimingAdmin {
	open: number;
	close: number;
	isOpen: boolean;
}

/**
 * Slot
 */
export class SlotAdmin {
	_id: number;
	date: string;
	isOpen: boolean;
	timings: TimingAdmin[];
}

/**
 * Time Slot
 */
export class TimeSlot {
	key: number;
	value: string;
}