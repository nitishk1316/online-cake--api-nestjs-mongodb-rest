import { Type } from "class-transformer";
import { ArrayMinSize, ValidateNested } from "class-validator";
import { MapLocation } from '../common/location.dto';

/**
 * Delivery Coverage Payload
 */
export class DCAdminPayload {
	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => MapLocation)
	coordinates: MapLocation[];
}

/**
 * Delivery Coverage
 */
export class DCAdmin {
	_id: number;
	name: string;
	coordinates: MapLocation[];
}

/**
 * Geometry
 */
export class Geometry {
	type: string;
	coordinates: [[[number, number]]];
}