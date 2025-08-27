export class TableFilter {
	key: string;
	value: any;
}

export class TitleValue {
	title: string;
	value: string;
}

export const ImageTag = {
	PRODUCT: 'product',
	BANNER: 'banner',
	TYPE: 'type',
	DEAL: 'deal',
}

/**
 * Image Upload
 */
 export class ImageUpload {
	fileId: string;
	url: string;
	thumbnail: string;
	filePath: string;
}

/**
 * Message
 */
 export class Message {
	message: string;
	status?: boolean;
	errors?: Array<string>;
}