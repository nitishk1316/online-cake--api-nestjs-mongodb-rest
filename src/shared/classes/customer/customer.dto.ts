import { IsNotEmpty, IsOptional, IsString, Length, MaxLength, MinLength } from "class-validator";

/**
 * Customer Payload
 */
 export class CustomerPayload {
	@IsNotEmpty()
	firstName: string;

	@IsNotEmpty()
	lastName: string;

	@IsOptional()
	email: string;

	@IsNotEmpty()
	@Length(8, 35)
	password: string;

	@IsNotEmpty()
	@MinLength(8)
	@MaxLength(12)
	mobileNumber: string;
}


/**
 * User
 */
 export class Customer {
	_id: number;
	firstName: string;
	lastName: string;
	email: string;
	mobileNumber: string;
}

/**
 * User
 */
export class User {
	_id: number;
	firstName: string;
	lastName: string;
	email: string;
	mobileNumber: string;
	role?: string;
	playerId?: string;
}

/**
 * Access Token
 */
 export class AccessToken {
	status: boolean;
	id: number;
	token: string;
	role: string;
	emailOrMobile: string;
	verify?: boolean;
	verificationToken?: string;
}

/**
 * Forgot Password Payload
 */
export class EmailMobilePayload {
	@IsNotEmpty()
	emailOrMobile: string;
}

/**
 * OTP Verify Payload
 */
export class OTPVerifyPayload {
	@IsNotEmpty()
	emailOrMobile: string;

	@IsNotEmpty()
	@Length(4)
	otp: string;

	@IsOptional()
	isForgot?: boolean;

	@IsOptional()
	playerId?: string;
}

/**
 * Customer Detail
 */
export class CustomerDetail {
	_id: number;
	firstName: string;
	lastName: string;
	email: string;
	mobileNumber: string;
	emailVerified: boolean;
	walletAmount: number;
	orderDelivered: number;
}

/**
 * Profile Update Payload
 */
export class ProfileUpdatePayload {
	@IsOptional()
	firstName: string;

	@IsOptional()
	lastName: string;
}

/**
 * Reset Password
 */
export class ResetPasswordPayload {
	@IsNotEmpty()
	verificationToken: string;

	@IsNotEmpty()
	@Length(8, 35)
	newPassword: string;

	confirmPassword?: string;
}

/**
 * Chnage Password
 */
export class ChangePasswordPayload {
	@IsString()
	@IsNotEmpty()
	@Length(8, 35)
	currentPassword: string;

	@IsString()
	@IsNotEmpty()
	@Length(8, 35)
	newPassword: string;

	confirmPassword?: string;
}

/**
 * Login Payload
 */
export class LoginPayload {
	@IsNotEmpty()
	emailOrMobile: string;

	@IsNotEmpty()
	password: string;

	@IsOptional()
	playerId?: string;
}

/**
 * Change Email Payload
 */
export class ChangeEmailPayload {
	@IsNotEmpty()
	email: string;
}

/**
 * Update Email Payload
 */
export class UpdateEmailPayload {
	@IsNotEmpty()
	email: string;

	@IsNotEmpty()
	otp: string;
}

/**
 * Change Mobile Payload
 */
export class ChangeMobilePayload {
	@IsNotEmpty()
	mobileNumber: string;
}

/**
 * Update Mobile Payload
 */
export class UpdateMobilePayload {
	@IsNotEmpty()
	mobileNumber: string;

	@IsNotEmpty()
	otp: string;
}