import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { genSalt, compare, hash } from 'bcrypt';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { CustomerPayload } from 'src/shared/classes';
import { ISequence, IUser, IVerification } from 'src/shared/models';
import { Roles } from 'src/shared/util';


@Injectable()
export class AuthService {
	/**
	 * Auth Service
	 * @param jwtService
	 * @param userModel
	 * @param sequenceModel
	 * @param verificationModel
	 */
  constructor (
		private readonly jwtService: JwtService,
		@InjectModel("User") private readonly userModel: Model<IUser>,
		@InjectModel("Sequence") private readonly sequenceModel: Model<ISequence>,
		@InjectModel("Verification") private readonly verificationModel: Model<IVerification>,
	) {}

	/**
	 * Generate salt for hashing password
	 * @return string - salt
	 */
	private async generateSalt(): Promise<string> {
		return await genSalt();
	}

	/**
	 * Hashes the user's plain text password into a cipher
	 * @param password
	 */
	public async hashPassword(password: string) {
		const salt = await this.generateSalt();
		const hashedPassword = await hash(password, salt);
		return { salt, hashedPassword };
	}

	/**
	 * Verify password
	 * @param password
	 * @param hashedPassword
	 * @return boolean
	 */
	public async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
		return await compare(password, hashedPassword);
	}

	/**
	 * Generate Token
	 * @param _id
	 * @param role
	 * @return string - auth token
	 */
	public async generateAccessToken(_id: number, role: string): Promise<string> {
		const payload = { _id };
		return this.jwtService.sign(payload, { expiresIn: '30d' });
	}

	/**
	 * Get user detail by email or mobileNumber
	 * @param email
	 * @param mobileNumber
	 * @return IUser - user detail
	 */
	 public getByEmailOrMobile(email: string, mobileNumber: string): Promise<IUser> {
		let filter: any = { $or: [{ mobileNumber: mobileNumber }] };
		if (email) {
			email = email.toLowerCase();
			filter = { $or: [{ mobileNumber: mobileNumber }, { email: email }] };
		}
		return this.userModel.findOne(filter, '_id email mobileNumber role').exec();
	}

	/**
	 * Create user
	 * @param payload
	 * @return IUser - user detail
	 */
	 async create(payload: CustomerPayload): Promise<IUser> {
		const data = { ...payload };
		const count = await this._getUserId();
		data['_id'] = count.value;
		const { salt, hashedPassword } = await this.hashPassword(payload.password);
		data['salt'] = salt;
		data['password'] = hashedPassword;
		data['role'] = Roles.CUSTOMER;

		this.verificationModel.create({ userId: data['_id'] });
		return this.userModel.create(data);
	}

	/**
	 * Set email verify
	 * @param userId
	 * @return UpdateWriteOpResult - update document
	 */
	 setEmailVerified(userId: number): Promise<UpdateWriteOpResult> {
		return this.userModel.updateOne({ _id: userId }, { emailVerified: true }).exec();
	}

	/**
	 * Set mobile verify
	 * @param userId
	 * @return UpdateWriteOpResult - update document
	 */
	 setMobileVerified(userId: number): Promise<UpdateWriteOpResult> {
		return this.userModel.updateOne({ _id: userId }, { mobileVerified: true }).exec();
	}

	/**
	 * Set verification token
	 * @param userId
	 * @param verificationToken
	 * @return IVerification
	 */
	 setVerifyToken(userId: number, verificationToken: string): Promise<UpdateWriteOpResult> {
		return this.verificationModel.updateOne({ userId: userId }, { verificationToken: verificationToken }).exec();
	}

	/**
	 * Set OTP and OTP expiry
	 * @param userId
	 * @param otp
	 * @param expiry
	 * @return UpdateWriteOpResult - update document
	 */
	 setOTP(userId: number, otp: string, expiry: number): Promise<UpdateWriteOpResult> {
		return this.verificationModel.updateOne({ userId: userId }, { otp: otp, expiry: expiry }).exec();
	}

	/**
	 * Get by verification token
	 * @param verificationToken
	 * @return IVerification
	 */
	 validateVerifyToken(verificationToken: string): Promise<IVerification> {
		return this.verificationModel.findOne({ verificationToken: verificationToken }).exec();
	}

	/**
	 * Update password
	 * @param userId
	 * @param password
	 * @param salt
	 * @return UpdateWriteOpResult - update document
	 */
	 updatePassword(userId: number, password: string, salt: string): Promise<UpdateWriteOpResult> {
		return this.userModel.updateOne({ _id: userId }, { password: password, salt: salt }).exec();
	}

	/**
	 * Get OTP
	 * @param userId
	 * @return IVerification
	 */
	 getOTP(userId: number): Promise<IVerification> {
		return this.verificationModel.findOne({ userId: userId }).exec();
	}

	/**
	 * Validate user detail by emailOrMobile
	 * @param emailOrMobile
	 * @return IUser - user detail
	 */
	 validateByEmailOrMobile(emailOrMobile: string): Promise<IUser> {
		emailOrMobile = emailOrMobile.toLowerCase();
		let filter = { $or: [{ email: emailOrMobile }, { mobileNumber: emailOrMobile }] };
		return this.userModel.findOne(filter, '_id email mobileNumber password role active mobileVerified emailVerified').exec();
	}

	/**
	 * Set playerId
	 * @param userId
	 * @return UpdateWriteOpResult - update document
	 */
	 setPlayerId(userId: number, playerId: string): Promise<UpdateWriteOpResult> {
		return this.userModel.updateOne({ _id: userId }, { playerId: playerId }).exec();
	}

	private _getUserId(): Promise<ISequence> {
		return this.sequenceModel.findOneAndUpdate({ "_id": "USER" }, { $inc: { "value": 1 } }, { new: true }).exec();
	}

}
