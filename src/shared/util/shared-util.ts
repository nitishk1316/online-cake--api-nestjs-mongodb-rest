const slug = require('slug');
import { v4 as uuidv4 } from 'uuid';
import { ImageTag } from '../classes';
import { SETTINGS } from '../settings';

/**
 * Generate OTP for verification
 * @param digit
 * @return string - OTP
 */
export function generateOTP(digit: number = 4): string {
  let start = 1000;
	let end = 9000;
	if (digit == 6) {
		start = 100000;
		end = 900000;
	}
	return Math.floor(start + Math.random() * end).toString();
}

/**
 * Add minutes to current time
 * @param minutes
 * @return number - upodated time in milliseconds
 */
export function getXminutesAheadTime(minutes: number): number {
	var d1 = new Date();
	var d2 = new Date(d1);
	d2.setMinutes(d1.getMinutes() + minutes);
	return d2.getTime();
}

/**
 * Resize image based on  image type
 * @param imageType
 * @param imageUrl
 * @return string - Updated image url
 */
export function resizeImage(imageType: string, imageUrl: string): string {
	const urlArr = imageUrl.split(SETTINGS.IMAGE_URL);

	let size = "tr:w-1920,h-810";
	if (imageType == ImageTag.BANNER)
		size = "tr:w-1920,h-810";
	else if (imageType == ImageTag.TYPE)
		size = "tr:w-780,h-520";
	else if (imageType == ImageTag.DEAL)
		size = "tr:w-672,h-310";
	else if (imageType == ImageTag.PRODUCT)
		size = "tr:w-300,h-300";

	imageUrl = `${SETTINGS.IMAGE_URL}/${size}${urlArr[1]}`;
	return imageUrl;
}

/**
 * Create slug
 * @param title
 * @return string - slug
 */
export function createSlug(title: string): string {
	return slug(title);
}

/**
 * Create SKU id for variant
 * @param title
 * @param capacity
 * @return string - SKU id
 */
export function createSKU(title: string, capacity: string): string {
	return title.replace(/\s/g, '').slice(0, 10).concat(capacity.replace(/\s/g, '').slice(0, 4)).toUpperCase() + Math.floor(Math.random() * 10000000) + 1;
}

/**
 * Replace last X string to X text
 * @param  str
 * @param xLen
 * @return string - replaced text
 */
export function replaceXString(str: string, xLen: number = 4): string {
	const len = str.length;
	let xStr = Array(xLen).join("X");
	return str.substring(0, len - xLen) + xStr;
}

/**
 * Generate UUID
 * @return string - UUID
 */
export function getUUID(): string {
	return uuidv4();
}