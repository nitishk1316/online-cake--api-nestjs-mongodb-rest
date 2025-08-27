import { Type } from "class-transformer";
import { IsNotEmpty,
	IsOptional,
	IsNumber,
	IsBoolean,
	Min,
	ArrayMinSize,
	ValidateNested,
} from "class-validator";

/**
 * Variant Payload
 */
 export class VariantPayload {
	@IsOptional()
	sku?: string;

	@IsNotEmpty()
	capacity: string;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	stock: number;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	originalPrice: number;

	@IsNotEmpty()
	@IsNumber()
	@Min(0)
	sellingPrice: number;

	discount?: number;
}

/**
 * Product Payload
 */
export class ProductPayload {
	@IsNotEmpty()
	title: string;

	@IsNotEmpty()
	desc: string;

	@IsNotEmpty()
	images: string[];

	@IsOptional()
	thumbnail?: string;

	@ArrayMinSize(1)
	@ValidateNested({ each: true })
	@Type(() => VariantPayload)
	variants: VariantPayload[];

	@IsNotEmpty()
	type: number;

	@IsBoolean()
	@IsOptional()
	popular?: boolean;

	@IsOptional()
	flavour?: number;

	@IsOptional()
	occasion?: number;
}

export class ImportProductPayload extends ProductPayload {
	_id: number;
}

/**
 * Variant
 */
 export class VariantAdmin {
	sku?: string;
	capacity: string;
	stock: number;
	originalPrice: number;
	sellingPrice: number;
	discount?: number;
}

/**
 * Product
 */
export class ProductAdmin {
	_id: number;
	title: string;
	type: number;
	active: boolean;
}

/**
 * Product Detail
 */
export class ProductAdminDetail {
	_id: number;
	title: string;
	desc: string;
	images: string[];
	thumbnail: string;
	type: number;
	active: boolean;
	variants: VariantAdmin[];
	flavour: number;
	occasion: number;
}

/**
 * Product List
 */
export class ProductAdminList {
	data: ProductAdmin[];
	total: number;
}

/**
 * Product Out Of Stock
 */
export class ProductAdminOFS {
	_id: number;
	title: string;
	capacity: string;
	active: boolean;
}

/**
 * Product Out Of Stock List
 */
export class ProductAdminOFSList {
	data: ProductAdminOFS[];
	total: number;
}

/**
 * Product Search Sort
 */
export class ProductAdminSearch {
	page?: number;
	limit?: number;
	title?: string;
	type?: number;
	sortBy?: string;
	orderBy?: number;
}