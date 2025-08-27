import { IsBoolean, IsNotEmpty, IsOptional } from "class-validator";

/**
 * Type Payload
 */
export class TypeAdminPayload {
	@IsNotEmpty()
	title: string;

	@IsNotEmpty()
	image: string;

	@IsBoolean()
	@IsOptional()
	popular: boolean;
}

/**
 * Type
 */
export class TypeAdmin {
	_id: number;
	title: string;
	image: string;
	active: boolean;
	popular: boolean;
}

/**
 * Type All
 */
export class TypeAdminDropdown {
	_id: number;
	title: string;
}

/**
 * Type List
 */
export class TypeAdminList {
	data: TypeAdmin[];
	total: number;
}

/**
 * Type Search Sort
 */
export class TypeAdminSearch {
	page?: number;
	limit?: number;
	title?: string;
	sortBy?: string;
	orderBy?: number;
}