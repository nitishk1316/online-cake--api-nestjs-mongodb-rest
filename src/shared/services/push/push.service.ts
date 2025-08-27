import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
const fetch = require('node-fetch');
import { LocaleService } from '../locale/locale.service';
import { MyLoggerService } from '../mylogger/mylogger.service';

/**
 * Push Service
 */
@Injectable()
export class PushService {
	private url = 'https://onesignal.com/api/v1/notifications';
	private userPush = {
		appId: '',
		secretKey: ''
	}
	private deliveryPush = {
		appId: '',
		secretKey: ''
	}

	/**
	 * Constructor
	 * @param logger
	 * @param localeService
	 * @param configService
	 */
	constructor(
		private readonly logger: MyLoggerService,
		private readonly localeService: LocaleService,
		private readonly configService: ConfigService,
	) {
		this.userPush.appId = this.configService.get('PUSH_CUSTOMER_APP_ID');
		this.userPush.secretKey = this.configService.get('PUSH_CUSTOMER_SECRET_KEY');

		this.deliveryPush.appId = this.configService.get('PUSH_DELIVERY_APP_ID');
		this.deliveryPush.secretKey = this.configService.get('PUSH_DELIVERY_SECRET_KEY');
	}

	/**
	 * Send push
	 * @param title
	 * @param message
	 * @param device
	 */
	private async sendPush(appId: string, secretKey: string, title: string, message: string, device: string | string[]): Promise<any> {
		let payload = {
			'app_id': appId,
      'contents': { en: message },
      'headings': { en: title },
      'include_player_ids': Array.isArray(device) ? device : [device]
		};

		const options = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'Authorization': 'Basic ' + secretKey
			},
			body: JSON.stringify(payload)
		}
		await fetch(this.url, options)
			.then((res: any) => res.json())
			.then((json: any) => this.logger.info(json) )
			.catch((err: any) => this.logger.error('error:' + err));
	}

	/**
	 * Send to customer
	 * @param title
	 * @param message
	 * @param device
	 */
  public async sendToCustomer(title: string, message: string, device: string | string[]): Promise<any> {
		const appId = this.userPush.appId;
		const secretKey = this.userPush.secretKey;
		this.logger.info(message);
		return this.sendPush(appId, secretKey, title, message, device);
	}

	/**
	 * Send to delivery
	 * @param title
	 * @param message
	 * @param device
	 */
	 public async sendToDelivery(title: string, message: string, device: string | string[]): Promise<any> {
		const appId = this.deliveryPush.appId;
		const secretKey = this.deliveryPush.secretKey;
		this.logger.info(message);
		return this.sendPush(appId, secretKey, title, message, device);
	}
}