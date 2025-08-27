import { IsBoolean, IsNotEmpty, IsOptional } from "class-validator";

/**
 * Flavour Payload
 */
export class FlavourAdminPayload {
	@IsNotEmpty()
	title: string;

	@IsNotEmpty()
	image: string;

	@IsBoolean()
	@IsOptional()
	popular: boolean;
}

/**
 * Flavour
 */
export class FlavourAdmin {
	_id: number;
	title: string;
	image: string;
	active: boolean;
	popular: boolean;
}

/**
 * Flavour All
 */
export class FlavourAdminDropdown {
	_id: number;
	title: string;
}

/**
 * Flavour List
 */
export class FlavourAdminList {
	data: FlavourAdmin[];
	total: number;
}

/**
 * Flavour Search Sort
 */
export class FlavourAdminSearch {
	page?: number;
	limit?: number;
	title?: string;
	sortBy?: string;
	orderBy?: number;
}