import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Post,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import {
	CustomerPayload,
	Message,
	LoginPayload,
	AccessToken,
	OTPVerifyPayload,
	EmailMobilePayload,
	ResetPasswordPayload
} from 'src/shared/classes';
import { IUser } from 'src/shared/models';
import { LocaleService, EmailService, SMSService } from 'src/shared/services';
import { SETTINGS } from 'src/shared/settings';
import { validateEmail, getXminutesAheadTime, getUUID, generateOTP } from 'src/shared/util';
import { AuthService } from './auth.service';

@Controller('')
export class AuthController {
	/**
   * Constructor
   * @param authService
	 * @param localeService
	 * @param emailService
	 * @param smsService
   */
	constructor(
		private readonly authService: AuthService,
		private readonly localeService: LocaleService,
		private readonly emailService: EmailService,
		private readonly smsService: SMSService,
	) {
	}

	@Post('/register')
	@UsePipes(new ValidationPipe({ whitelist: true }))
  public async register(@Body() payload: CustomerPayload): Promise<Message> {
		if (payload.email == '') payload.email = null;

		if(payload.mobileNumber && isNaN(parseInt(payload.mobileNumber)))
			throw new BadRequestException(this.localeService.get('MSG_AUTH_INVALID_MOBILE_FORMAT'));

		if(payload.email && !validateEmail(payload.email))
			throw new BadRequestException(this.localeService.get('MSG_AUTH_INVALID_EMAIL_FORMAT'));

		const checkUser = await this.authService.getByEmailOrMobile(payload.email, payload.mobileNumber);
		let message: string;

		if (checkUser && checkUser.mobileNumber == payload.mobileNumber)
			message = this.localeService.get('MSG_AUTH_MOBILE_ALREADY');
		else if (checkUser && checkUser.email == payload.email)
			message = this.localeService.get('MSG_AUTH_EMAIL_ALREADY');

		if (message) throw new BadRequestException(message);

		const user = await this.authService.create(payload);
		if (!user)
			throw new BadRequestException(this.localeService.get('MSG_CREATE_FAILURE'));
		return { status: true } as Message;
	}

	@Post('/login')
	@UsePipes(new ValidationPipe({ whitelist: true }))
  public async login(@Body() payload: LoginPayload): Promise<AccessToken> {
		const isEmail = await this._isEmailPayload(payload.emailOrMobile);
		const checkUser = await this._isAccountExist(payload.emailOrMobile);

		if (!checkUser.mobileVerified)
			return { status: false, verify: true, emailOrMobile: checkUser.mobileNumber } as AccessToken;

		if (isEmail && !checkUser.emailVerified)
			return { status: false, verify: true, emailOrMobile: checkUser.email } as AccessToken;

		await this._checkBlock(checkUser);
		const isValidPassword: boolean = await this.authService.verifyPassword(payload.password, checkUser.password);
		if (!isValidPassword)
			throw new BadRequestException(this.localeService.get('MSG_AUTH_INVALID_EMAIL_PASSWORD'));

		if (payload.playerId) this.authService.setPlayerId(checkUser._id, payload.playerId);
		return await this._getAccessToken(checkUser);
	}

	@Post('/verify')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  public async verify(@Body() payload: OTPVerifyPayload): Promise<AccessToken> {
		const isEmail = await this._isEmailPayload(payload.emailOrMobile);
		const checkUser = await this._isAccountExist(payload.emailOrMobile);

		await this._checkBlock(checkUser);
		const status = await this._verifyOTP(checkUser._id, payload.otp);
		if (!status) throw new BadRequestException(this.localeService.get('MSG_AUTH_INVALID_OTP'));

		let verificationToken = null;
		if (payload.isForgot) verificationToken = getUUID();

		if (isEmail) this.authService.setEmailVerified(checkUser._id);
		else this.authService.setMobileVerified(checkUser._id);

		if (payload.isForgot) {
			this.authService.setVerifyToken(checkUser._id, verificationToken);
			return { verificationToken: verificationToken } as AccessToken;
		}
		else {
			if (payload.playerId) this.authService.setPlayerId(checkUser._id, payload.playerId);
			return await this._getAccessToken(checkUser);
		}
	}

	@Post('/send-otp')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  public async loginViaOTP(@Body() payload: EmailMobilePayload): Promise<Message> {
		const isEmail = await this._isEmailPayload(payload.emailOrMobile);
		const checkUser = await this._isAccountExist(payload.emailOrMobile);

		// DEMO - For release uncomment this
		//const otp = generateOTP();

		// DEMO - For release remove below lines
		let otp: string = "2345";
		// if (isEmail)
		// 	otp = generateOTP();
		// till here

		const otpExpiry = getXminutesAheadTime(SETTINGS.OTP_TIME_LIMIT);
		this.authService.setOTP(checkUser._id, otp, otpExpiry);
		let message = null;

		if (isEmail) message = await this.emailService.sendVerifyOTP(payload.emailOrMobile, checkUser.firstName, otp);
		else message = await this.smsService.sendVerifyOTP(payload.emailOrMobile, checkUser.firstName, otp);

		return { status: true, message: message } as Message;
	}

	@Post('/reset-password')
	@UsePipes(new ValidationPipe({ whitelist: true }))
  public async resetPassword(@Body() payload: ResetPasswordPayload): Promise<Message> {
		const checkUser = await this.authService.validateVerifyToken(payload.verificationToken);

		if (!checkUser)
			throw new BadRequestException(this.localeService.get('MSG_AUTH_NO_ACCOUNT_FOUND'));

		const { salt, hashedPassword } = await this.authService.hashPassword(payload.newPassword);
		this.authService.setOTP(checkUser.userId, null, null);
		const newPaswword = await this.authService.updatePassword(checkUser.userId, hashedPassword, salt);
		if (newPaswword.modifiedCount != 1)
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));

		return { message: this.localeService.get('MSG_AUTH_PASSWORD_CHANGED_SUCCESS') };
	}

	@Post('/validate-email-mobile')
	@UsePipes(new ValidationPipe({ whitelist: true }))
  public async checkEmailMobile(@Body() payload: EmailMobilePayload): Promise<Message> {
		const checkUser = await this._isAccountExist(payload.emailOrMobile);
		return { message: "Success" };
	}

	@Get('/anonymous')
	public async getAnonymous(): Promise<{ id: string }> {
		const id = getUUID();
		return { id };
	}

	/**
	 * Validate user is blocked by admin or for invalid password/OTP
	 * @param user
	 * @return boolean
	 */
	private async _checkBlock(user: IUser): Promise<boolean> {
		if (!user.active)
			throw new BadRequestException(this.localeService.get('MSG_AUTH_ACCOUNT_BLOCKED_BY_ADMIN'));
		return true;
	}

	/**
	 * Check payload is email or mobile number
	 * @param emailOrMobile
	 * @return boolean
	 */
	private async _isEmailPayload(emailOrMobile: string): Promise<boolean> {
		let isEmail = false;
		let n = emailOrMobile.indexOf("@");
		if (n != -1) isEmail = true;
		return isEmail;
	}

	/**
	 * Get Access token for logged in user
	 * @param user
	 * @return AccessToken - access token
	 */
	private async _getAccessToken(user: IUser): Promise<AccessToken> {
		const token: string = await this.authService.generateAccessToken(user._id, user.role);
		return { status: true, token: token, role: user.role } as AccessToken;
	}

	/**
	 * Verify otp by user
	 * @param user
	 * @param otp
	 * @return boolean
	 */
	private async _verifyOTP(userId: number, otp: string): Promise<boolean> {
		let status = false;
		const user = await this.authService.getOTP(userId);
		const currentTime = (new Date()).getTime();
		if (user.otp && currentTime > user.expiry)
			throw new BadRequestException(this.localeService.get('MSG_AUTH_OTP_ADDED'));

		if (user.otp == otp) status = true;
		return status;
	}

	/**
	 * Get User by email or mobile
	 * @param emailOrMobile
	 * @return IUser
	 */
	private async _isAccountExist(emailOrMobile: string): Promise<IUser> {
		const checkUser = await this.authService.validateByEmailOrMobile(emailOrMobile);
		if (!checkUser)
			throw new BadRequestException(this.localeService.get('MSG_AUTH_NO_ACCOUNT_FOUND'));
		return checkUser;
	}
}
