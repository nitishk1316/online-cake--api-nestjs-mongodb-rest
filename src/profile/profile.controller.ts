import {
	Controller,
	Get,
	Put,
	UseGuards,
	Body,
	UsePipes,
	ValidationPipe,
	NotFoundException,
	BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/authentication/auth.service';
import {
	ChangeEmailPayload,
	ChangeMobilePayload,
	ChangePasswordPayload,
	Message,
	ProfileUpdatePayload,
	UpdateEmailPayload,
	UpdateMobilePayload,
	User,
	CustomerDetail
} from 'src/shared/classes';
import { Wallet } from 'src/shared/classes/wallet/wallet.dto';
import { IWallet } from 'src/shared/models/wallet/wallet.model';
import { EmailService, GetUser, LocaleService, SMSService } from 'src/shared/services';
import { SETTINGS } from 'src/shared/settings';
import { getDateTime, getXminutesAheadTime, validateCustomerRole } from 'src/shared/util';
import { ProfileService } from './profile.service';

/**
 * Profile Controller
 */
@Controller('/profile')
@UseGuards(AuthGuard('jwt'))
export class ProfileController {
	/**
	 * Constructor
	 * @param profileService
	 * @param localeService
	 * @param emailService
	 * @param smsService
	 * @param authService
	 */
	constructor(
		private readonly profileService: ProfileService,
		private readonly localeService: LocaleService,
		private readonly emailService: EmailService,
		private readonly smsService: SMSService,
		private readonly authService: AuthService,
	) {
	}

	@Get('/me')
	public async me(@GetUser() user: User): Promise<CustomerDetail> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		const userInfo = await this.profileService.getInfoById(user._id) as CustomerDetail;
		if (userInfo) {
			return userInfo;
		}
		else
			throw new NotFoundException();
	}

	@Put('/me')
	@UsePipes(new ValidationPipe({ whitelist: true }))
	public async update(@GetUser() user: User, @Body() payload: ProfileUpdatePayload): Promise<Message> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();
		const userInfo = await this.profileService.updateProfile(user._id, payload);

		if (userInfo.modifiedCount != 1)
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));

		return { message: this.localeService.get('MSG_UPDATE_SUCCESS') } as Message;
	}

	@Put('/change-email')
	@UsePipes(new ValidationPipe({ whitelist: true }))
	public async changeEmail(@GetUser() user: User, @Body() payload: ChangeEmailPayload): Promise<Message> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		const isEmailExist = await this.profileService.validateByEmailOrMobile(payload.email);
		if (isEmailExist)
			throw new BadRequestException(this.localeService.get('MSG_AUTH_EMAIL_ALREADY'));

		// DEMO - For release uncomment this
		//const otp = generateOTP();
		// DEMO - For release remove below line
		const otp: string = "2345";

		const otpExpiry = getXminutesAheadTime(SETTINGS.OTP_TIME_LIMIT);

		//Send OTP to email
		this.authService.setOTP(user._id, otp, otpExpiry);
		let message = await this.emailService.sendVerifyOTP(payload.email, user.firstName, otp);

		await this.profileService.setEmailMobile(user._id, payload.email);
		return { status: true, message: message };
	}

	@Put('/update-email')
	@UsePipes(new ValidationPipe({ whitelist: true }))
	public async updateEmail(@GetUser() user: User, @Body() payload: UpdateEmailPayload): Promise<Message> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		const userInfo = await this.profileService.getUserVeification(user._id);
		if (userInfo.email != payload.email)
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));

		if (userInfo.otp != payload.otp)
			throw new BadRequestException(this.localeService.get('MSG_AUTH_INVALID_OTP'));

		const currentTime = (new Date()).getTime();
		if (currentTime > userInfo.expiry)
			throw new BadRequestException(this.localeService.get('MSG_AUTH_OTP_EXPIRED'));

		this.authService.setOTP(user._id, null, null);
		this.profileService.setTempMobile(user._id, null);

		await this.profileService.updateEmail(user._id, payload.email);
		return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
	}

	@Put('/change-mobile')
	@UsePipes(new ValidationPipe({ whitelist: true }))
	public async changeMobile(@GetUser() user: User, @Body() payload: ChangeMobilePayload): Promise<Message> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		const checkUser = await this.profileService.validateByEmailOrMobile(payload.mobileNumber);
		if (checkUser)
			throw new BadRequestException(this.localeService.get('MSG_AUTH_MOBILE_ALREADY'));

		// DEMO - For release uncomment this
		//const otp = generateOTP();
		// DEMO - For release remove below line
		const otp: string = "2345";

		const otpExpiry = getXminutesAheadTime(SETTINGS.OTP_TIME_LIMIT);
		this.authService.setOTP(user._id, otp, otpExpiry);
		let message = await this.smsService.sendVerifyOTP(payload.mobileNumber, user.firstName, otp);

		await this.profileService.setTempMobile(user._id, payload.mobileNumber);
		return { status: true, message: message };
	}

	@Put('/update-mobile')
	@UsePipes(new ValidationPipe({ whitelist: true }))
	public async updateMobile(@GetUser() user: User, @Body() payload: UpdateMobilePayload): Promise<Message> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		const verifyInfo = await this.profileService.getUserVeification(user._id);
		if (verifyInfo.mobileNumber != payload.mobileNumber)
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));

		if (verifyInfo.otp != payload.otp)
			throw new BadRequestException(this.localeService.get('MSG_AUTH_INVALID_OTP'));

		const currentTime = (new Date()).getTime();
		if (currentTime > verifyInfo.expiry)
			throw new BadRequestException(this.localeService.get('MSG_AUTH_OTP_EXPIRED'));

		this.authService.setOTP(user._id, null, null);
		this.profileService.setTempMobile(user._id, null);

		await this.profileService.updateMobile(user._id, payload.mobileNumber);
		return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
	}

	@Put('/change-password')
	@UsePipes(new ValidationPipe({ whitelist: true }))
	public async changePassword(@GetUser() user: User, @Body() payload: ChangePasswordPayload): Promise<Message> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		const userInfo = await this.profileService.getById(user._id);
		const isPasswordMatch = await this.authService.verifyPassword(payload.currentPassword, userInfo.password);
		if (!isPasswordMatch)
			throw new BadRequestException(this.localeService.get('MSG_INVALID_CURRENT_PASSWORD'));

		const { salt, hashedPassword } = await this.authService.hashPassword(payload.newPassword);
		await this.profileService.updatePassword(user._id, hashedPassword, salt);

		return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
	}

	@Get('/wallet')
	public async wallet(@GetUser() user: User): Promise<Wallet[]> {
		if (!validateCustomerRole(user.role)) throw new NotFoundException();

		const response = await this.profileService.getWallet(user._id);
		const wallets: Wallet[] = [];

		response.forEach((w: IWallet) => {
			const o: Wallet = {
				createdAt: getDateTime(w.createdAt),
				amount: w.amount,
				order: w.order,
				cancelBy: w.cancelBy,
				walletType: w.walletType,
			}
			wallets.push(o);
		})
		return wallets;
	}
}