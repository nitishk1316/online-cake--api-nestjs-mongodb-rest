import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SETTINGS } from 'src/shared/settings';
const fetch = require('node-fetch');
import { LocaleService } from '../locale/locale.service';
import { MyLoggerService } from '../mylogger/mylogger.service';

/**
 * Email Service
 */
@Injectable()
export class EmailService {
	private url = 'https://api.sendinblue.com/v3/smtp/email ';
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
	}

	/**
	 * Send email
	 * @param email
	 * @param subject
	 * @param html
	 */
	private async sendEmail(email: string, subject: string, html?: string): Promise<any> {
		let payload = {
			to: [{
				email: email
			}],
			sender: {
				email: SETTINGS.EMAIL_SENDER,
				name: SETTINGS.EMAIL_SENDER_NAME
			},
			subject: subject
		};
		if (html) payload['htmlContent'] = html;

		const options = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'api-key': this.configService.get('EMAIL_API_KEY')
			},
			body: JSON.stringify(payload)
		}
		await fetch(this.url, options)
			.then((res: any) => res.json())
			.then((json: any) => this.logger.info(json) )
			.catch((err: any) => this.logger.error('error:' + err));
	}

	/**
	 * Send OTP
	 * @param email
	 * @param firstName
	 * @param otp
	 */
  public async sendVerifyOTP(email: string, firstName: string, otp: string): Promise<string> {
		let successMessage: string;
			const subject = this.localeService.get('TEMPLATE_EMAIL_VERIFY_OTP_TITLE');
			const message = this.localeService.get('TEMPLATE_EMAIL_VERIFY_OTP_MSG', { firstName: firstName, otp: otp });
			successMessage = this.localeService.get('INFO_OTP_SENT') + ' ' + email;

			// DEMO - For relese uncomment this
			// this.sendEmail(email, subject, message);
			this.logger.info(message);
			return successMessage;
	}
}