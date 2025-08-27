import { Currency } from "../setting/setting.dto";

/**
 * Report Total
 */
export class ReportAdminTotal {
	product: number;
	order: number;
	amount: number;
	currency: string;
	type?: number;
	flavour?: number;
	occasion?: number;
}

/**
 * Order
 */
 export class ReportOrder {
	_id: number;
	createdAt: string;
	grandTotal: number;
	count: number;
	method: string;
	status: string;
	currency: Currency;
}