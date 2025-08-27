import { IsNotEmpty } from "class-validator";
/**
 * MapLocation
 */
export class MapLocation {
	@IsNotEmpty()
	latitude: number;

	@IsNotEmpty()
	longitude: number;
}
