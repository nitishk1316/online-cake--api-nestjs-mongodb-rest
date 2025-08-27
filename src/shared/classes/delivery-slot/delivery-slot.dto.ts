import { IsOptional } from "class-validator";

/**
 * Timing
 */
export class Timing {
	key: string;
	time: string;
}

/**
 * Slot
 */
export class DeliverySlot {
	_id: number;
	day: string;
	date: string;
	timings: Timing[];
}