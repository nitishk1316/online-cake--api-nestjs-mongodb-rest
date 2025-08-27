/**
 * Deal
 */
export class Deal {
	_id?: number;
	title: string;
	image?: string;
	dealType?: string;
	value: number;
	type: {
		id: number,
		title: string
	};
	slug: string;
}