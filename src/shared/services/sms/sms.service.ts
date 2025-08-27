import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SETTINGS } from 'src/shared/settings';
const fetch = require('node-fetch');
import { LocaleService } from '../locale/locale.service';
import { MyLoggerService } from '../mylogger/mylogger.service';

/**
 * SMS Service
 */
@Injectable()
export class SMSService {
	private url = 'https://api.sendinblue.com/v3/transactionalSMS/sms';
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
	 * Send SMS
	 * @param mobileNumber
	 * @param content
	 */
	public async sendSMS(mobileNumber: string, content: string): Promise<any> {
		mobileNumber = SETTINGS.SMS_COUNTRY_CODE + mobileNumber;
		mobileNumber = mobileNumber.replace('+', '');
		const options = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'api-key': this.configService.get('SMS_API_KEY')
			  },
			  body: JSON.stringify({
					type: 'transactional',
					sender: SETTINGS.SMS_SENDER,
					recipient: mobileNumber,
					content: content
			  })
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
  public async sendVerifyOTP(mobileNumber: string, firstName: string, otp: string): Promise<string> {
		let successMessage: string;
		const otpMessage = this.localeService.get('TEMPLATE_MOBILE_VERIFY_OTP_MSG', { firstName: firstName, otp: otp });

		// DEMO - For relese uncomment this
		// this.sendOTP(mobileNumber, otpMessage);
		this.logger.info(otpMessage);
		successMessage = this.localeService.get('INFO_OTP_SENT')  + ' ' + mobileNumber;
		return successMessage;
	}
}