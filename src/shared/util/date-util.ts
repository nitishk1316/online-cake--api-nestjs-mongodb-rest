const moment = require('moment');
import { Moment } from 'moment';
import { SETTINGS } from '../settings';

/**
 * Get current date
 * @param milliseconds
 * @return Moment - Moment date object
 */
export function getCurrentDate(milliseconds: number = null): Moment {
	return milliseconds ? moment(milliseconds).tz(SETTINGS.TIME_ZONE): moment().tz(SETTINGS.TIME_ZONE);
}

/**
 * Get date from year, month, date
 * @param y
 * @param m
 * @param d
 */
export function getDateForReport(y: number, m: number, d: number) {
	return moment({ y: y, M: m, d: d });
}

/**
 * Get Date and Time by date
 * @param date
 */
export function getDateTime(date: string): string {
	return moment(date).tz(SETTINGS.TIME_ZONE).locale('en').format('DD-MMM-YYYY hh:mmA z');
}

/**
 * Get Date
 * @param date
 */
export function getDate(date: string): string {
	return moment(date).tz(SETTINGS.TIME_ZONE).locale('en').format('DD-MMM-YYYY');
}

/**
 * Get Slot date
 * @param dayId
 */
export function getSlotDate(dayId: number): string {
	return moment().tz(SETTINGS.TIME_ZONE).add(dayId, 'days').format('DD MMM');
}

/**
 * Get Slot Day
 * @param dayId
 */
export function getSlotDay(dayId: number): string {
	return moment().tz(SETTINGS.TIME_ZONE).add(dayId, 'days').format('ddd');
}

/**
 * Get Slot Date and Day
 * @param dayId
 */
export function getSlotDateDay(dayId: number): string {
	return moment().tz(SETTINGS.TIME_ZONE).add(dayId, 'days').format('dddd, DD MMM YYYY');
}

/**
 * Get slot time
 * @param date
 * @param minutes
 * @returns
 */
 export function getSlotTime(minutes: number): string {
	return moment().startOf('day').add(minutes, 'minutes').format('hh:mmA');
}


/**
 * get Slot Weekday
 */
export function getWeekday(): number {
	return moment().tz(SETTINGS.TIME_ZONE).weekday();
}

/**
 * Add days to current week
 * @param addDay
 * @returns
 */
export function addDaysToDate(addDay: number): Date {
	return moment().startOf('week').add(addDay, 'days');
}

/**
 * Add minutes to date
 * @param date
 * @param minutes
 * @returns
 */
export function addMinutesToDate(date: Date, minutes: number): Date {
	return moment(date).startOf('day').add(minutes, 'minutes');
}

/**
 *
 * @param date
 * @returns
 */
export function getDeliveryDate(date: Date): string {
	return moment(date).tz(SETTINGS.TIME_ZONE).format('DD-MMM-YYYY');
}

/**
 *
 * @param date
 * @returns
 */
export function getDeliveryTime(date: Date): string {
	return moment(date).tz(SETTINGS.TIME_ZONE).format('hh:mmA');
}
