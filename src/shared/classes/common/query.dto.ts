import { IsNotEmpty } from "class-validator";

/**
 * Query Params
 */
export class QueryParams {
	page: number;
	limit: number;
}

/**
 * Query params with search
 */
export class QueryParamsWithSearch extends QueryParams {
	q: string;
	status: string;
}

/**
 * Status Payload
 */
export class StatusPayload {
	@IsNotEmpty()
	active: boolean;
}
