/**
 * Variant
 */
 export class Variant {
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
export class Product {
	_id: number;
	slug: string;
	title: string;
	desc: string;
	thumbnail: string;
	images: string[];
	variants: Variant[];
	type: number;
	flavour?: number;
	occasion?: number;
	active: boolean;
}

/**
 * Product
 */
export class ProductDetail extends Product {

}

/**
 * Product List
 */
export class ProductList {
	data: Product[];
	total: number;
}

/**
 * Product Search
 */
export class ProductSearch {
	page?: number;
	limit?: number;
	search?: string;
	type?: string;
	flavour?: string;
	occasion?: string;
	popular?: boolean;
}
