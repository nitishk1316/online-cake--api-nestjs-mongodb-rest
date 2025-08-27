import { IsNotEmpty } from "class-validator";

/**
 * Page Payload
 */
export class PagePayload {
	@IsNotEmpty()
	title: string;

	@IsNotEmpty()
	desc: string;
}

/**
 * Page
 */
export class PageAdmin {
	_id: string;
	title: string;
	desc: string;
	url: string;
	active: boolean;
}

/**
 * Page List
 */
export class PageAdminList {
	data: PageAdmin[];
	total: number;
}