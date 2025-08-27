import { QueryParams, QueryParamsWithSearch } from "../classes";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const Roles = {
	CUSTOMER: 'CUSTOMER',
	ADMIN: 'ADMIN',
	DELIVERY: 'DELIVERY'
}

/**
 *
 * @param role
 */
export function validateAdminRole(role: string): boolean {
  const roles = [Roles.ADMIN];
	return roles.includes(role)
}

/**
 *
 * @param role
 */
export function validateCustomerRole(role: string): boolean {
  const roles = [Roles.CUSTOMER, Roles.DELIVERY, Roles.ADMIN];
	return roles.includes(role)
}

/**
 *
 * @param role
 */
 export function validateDeliveryRole(role: string): boolean {
  const roles = [Roles.DELIVERY, Roles.ADMIN];
	return roles.includes(role)
}

/**
 * Validate email format
 * @param email
 * @return boolean
 */
export function validateEmail(email: string): boolean  {
	const tester = /^[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~](\.?[-!#$%&'*+\/0-9=?A-Z^_a-z`{|}~])*@[a-zA-Z0-9](-*\.?[a-zA-Z0-9])*\.[a-zA-Z](-?[a-zA-Z0-9])+$/;
	if (!email) return false;
	if (email.length > 256) return false;
	if (!tester.test(email)) return false;
	const [account, address] = email.split('@');

	if (account.length > 64) return false;
	const domainParts = address.split('.');
	const status = domainParts.some((part) => { return part.length > 63; })
	if (status) return false;
	return true;
}

/**
 * Validate query parameters
 * @param query
 */
export function validateQuery(query: QueryParams|QueryParamsWithSearch): { page: number, limit: number, search: string, status: string } {
	let page: number = Number(query.page) || 1;
	let limit: number = Number(query.limit) || 20;
	let search = query['q'] || '';

	if (page < 0) page = 1;
	page = page - 1;

	if (limit < 0) limit = 20;
	else if (limit > 100) limit = 100;

	if(query['q'] && query['q'].length < 3) search = '';

	let status = query['status'] || null;
	return { page: page, limit, search, status };
}

/**
 * Validate page query
 * @param page
 * @return number
 */
export function validatePageQuery(page: number): number {
	page = Number(page) || DEFAULT_PAGE;
	if (page < 0) page = DEFAULT_PAGE;
	page = page - 1;
	return page;
}

/**
 * Validate limit query
 * @param limit
 * @return number
 */
export function validateLimitQuery(limit: number): number {
	limit = Number(limit) || DEFAULT_LIMIT;
	if (limit < 0) limit = DEFAULT_LIMIT;
	else if (limit > MAX_LIMIT) limit = MAX_LIMIT;
	return limit;
}

/**
 * Validate sort order query
 * @param order
 * @return number
 */
export function validateSortOrder(order: number): number {
	let sortOrder= -1;
	if (order == 1)	sortOrder = 1;
	else sortOrder = -1;
	return sortOrder;
}