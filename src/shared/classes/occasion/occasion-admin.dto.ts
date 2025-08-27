import { IsBoolean, IsNotEmpty, IsOptional } from "class-validator";

/**
 * Occasion Payload
 */
export class OccasionAdminPayload {
	@IsNotEmpty()
	title: string;

	@IsNotEmpty()
	image: string;

	@IsBoolean()
	@IsOptional()
	popular: boolean;
}

/**
 * Occasion
 */
export class OccasionAdmin {
	_id: number;
	title: string;
	image: string;
	active: boolean;
	popular: boolean;
}

/**
 * Occasion All
 */
export class OccasionAdminDropdown {
	_id: number;
	title: string;
}

/**
 * Occasion List
 */
export class OccasionAdminList {
	data: OccasionAdmin[];
	total: number;
}

/**
 * Occasion Search Sort
 */
export class OccasionAdminSearch {
	page?: number;
	limit?: number;
	title?: string;
	sortBy?: string;
	orderBy?: number;
}