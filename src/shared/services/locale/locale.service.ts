import { Injectable } from '@nestjs/common';
const path = require('path');
const i18n = require('i18n');

/**
 * Locale Service
 */
@Injectable()
export class LocaleService {
  constructor() { }

	/**
	 * Configure locale for app
	 * @param locales
	 * @param defaultLocale
	 */
  public configure(locales: string[], defaultLocale: string): void {
		i18n.configure({
			locales: locales,
			defaultLocale: defaultLocale,
			directory: path.join(__dirname, './../../../i18n')
		});
  }

	/**
	 * Get translation of key
	 * @param key
	 * @param obj - translation params
	 * @return string - translated value
	 */
  get(key: string, obj?: object): string {
    return i18n.__(key, obj);
  }

	/**
	 * Set current locale to app
	 * @param code
	 */
	setLocale(code: string): void {
		i18n.setLocale(code);
	}
}