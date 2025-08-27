import {
	IsNotEmpty,
	IsOptional,
	IsString,
	IsEnum,
} from "class-validator";

/**
 * Banner Type
 */
export enum BannerType {
	NONE = 'NONE',
	TYPE = 'TYPE',
	EXTERNAL = 'EXTERNAL'
}

/**
 * Create Banner Payload
 */
export class BannerAdminPayload {
	@IsNotEmpty()
	title: string;

	@IsNotEmpty()
	image: string;

	@IsNotEmpty()
	@IsString()
	@IsEnum(BannerType, { message: 'bannerType must be one of these ' + Object.keys(BannerType) })
	bannerType: string;

	@IsOptional()
	type?: number;

	@IsOptional()
	link?: string;
}

/**
 * Banner Admin
 */
export class BannerAdmin {
	_id: number;
	active: boolean;
	title: string;
	image: string;
	bannerType: string;
	type: number;
	link: string;
}

/**
 * Banner List
 */
export class BannerAdminList {
	data: BannerAdmin[];
	total: number;
}

/**
 * Banner Search
 */
export class BannerAdminSearch {
	page?: number;
	limit?: number;
	title?: string;
	bannerType?: string;
	sortBy?: string;
	orderBy?: number;
}