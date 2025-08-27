/**
 * Customer
 */
 export class CustomerAdmin {
	_id: number;
	firstName: string;
	lastName: string;
	email: string;
	mobileNumber: string;
	orderPurchased: number;
	createdAt?: string;
}

/**
 * Customer List
 */
export class CustomerAdminList {
	data: CustomerAdmin[];
	total: number;
}

/**
 * Customer Search
 */
export class CustomerAdminSearch {
	page?: number;
	limit?: number;
	email?: string;
	sortBy?: string;
	orderBy?: number;
}