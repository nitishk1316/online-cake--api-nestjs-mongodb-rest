import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from 'mongoose';
import { ProfileUpdatePayload, WalletPayload, WalletType } from 'src/shared/classes';
import { IUser, IVerification, IWallet } from 'src/shared/models';

/**
 * Profile Service
 */
@Injectable()
export class ProfileService {
	/**
   * Constructor
	 * @param userModel
	 * @param verificationModel
	 */
  constructor(
		@InjectModel("User") private readonly userModel: Model<IUser>,
		@InjectModel("Verification") private readonly verificationModel: Model<IVerification>,
		@InjectModel("Wallet") private readonly walletModel: Model<IWallet>,
	) {}

	/**
	 * Validate user detail by emailOrMobile
	 * @param emailOrMobile
	 * @return IUser - user detail
	 */
	validateByEmailOrMobile(emailOrMobile: string): Promise<IUser> {
		emailOrMobile = emailOrMobile.toLowerCase();
		let filter = { $or: [{ email: emailOrMobile }, { mobileNumber: emailOrMobile }] };
		return this.userModel.findOne(filter).exec();
	}

	/**
	 * Set Temp mobileNumber
	 * @param userId
	 * @param mobileNumber
	 * @return UpdateWriteOpResult - update document
	 */
	setTempMobile(userId: number, mobileNumber: string): Promise<UpdateWriteOpResult> {
		return this.verificationModel.updateOne({ userId: userId }, { mobileNumber: mobileNumber }).exec();
	}

	/**
	 * Set Temp email
	 * @param userId
	 * @param email
	 * @return UpdateWriteOpResult - update document
	 */
	 setEmailMobile(userId: number, email: string): Promise<UpdateWriteOpResult> {
		return this.verificationModel.updateOne({ userId: userId }, { email: email }).exec();
	}

	/**
	 * Get user
	 * @param userId
	 * @return UpdateWriteOpResult - update document
	 */
	 getUserVeification(userId: number): Promise<IVerification> {
		return this.verificationModel.findOne({ userId: userId }).exec();
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
	 * Get user Info for order by id
	 * @param userId
	 * @return IUser - user detail
	 */
	getInfoById(userId: number): Promise<IUser> {
		return this.userModel.findOne({ _id: userId }, 'email firstName lastName mobileNumber emailVerified mobileVerified walletAmount orderDelivered').exec();
	}

	/**
	 * Get user detail by id
	 * @param userId
	 * @return IUser - user detail
	 */
	getById(userId: number): Promise<IUser> {
		return this.userModel.findOne({ _id: userId }).exec();
	}

	/**
	 * Update profile
	 * @param userId
	 * @param payload
	 * @return UpdateWriteOpResult - update document
	 */
	updateProfile(userId: number, payload: ProfileUpdatePayload): Promise<UpdateWriteOpResult> {
		return this.userModel.updateOne({ _id: userId }, payload).exec();
	}

	/**
	 * Update email
	 * @param userId
	 * @param email
	 * @return UpdateWriteOpResult - update document
	 */
	updateEmail(userId: number, email: string): Promise<UpdateWriteOpResult> {
		return this.userModel.updateOne({ _id: userId }, { email: email }).exec();
	}

	/**
	 * Update mobile
	 * @param userId
	 * @param mobileNumber
	 * @return UpdateWriteOpResult - update document
	 */
	updateMobile(userId: number, mobileNumber: string): Promise<UpdateWriteOpResult> {
		return this.userModel.updateOne({ _id: userId }, { mobileNumber: mobileNumber }).exec();
	}

	/**
	 * Update user purchase count
	 * @param userId
	 * @return UpdateWriteOpResult - update document
	 */
	updatePurchased(userId: number): Promise<UpdateWriteOpResult> {
		return this.userModel.updateOne({ _id: userId }, { $inc:  { orderPurchased: 1 } }).exec();
	}

	/**
	 * Debit to wallet
	 * @param payload
	 */
	async debitToWallet(payload: WalletPayload) {
		const user = await this.userModel.findOne({ _id: payload.user }, 'walletAmount').exec();
		const walletAmount = user.walletAmount || 0;
		payload.walletType = WalletType.DEBITED;

		await this.walletModel.create(payload);
		const amount = (walletAmount + payload.amount).toFixed(2);
		await this.userModel.updateOne({ _id: payload.user }, { walletAmount: Number(amount) }).exec();
	}

	/**
	 * Credit to wallet
	 * @param payload
	 */
	async creditToWallet(payload: WalletPayload) {
		const user = await this.userModel.findOne({ _id: payload.user }, 'walletAmount').exec();
		const walletAmount = user.walletAmount || 0;
		payload.walletType = WalletType.CREDITED;

		await this.walletModel.create(payload);
		const amount = (walletAmount - payload.amount).toFixed(2);
		await this.userModel.updateOne({ _id: payload.user }, { walletAmount: Number(amount) }).exec();
	}

	/**
	 * Get wallet by user
	 * @param userId
	 * @return IUser - user detail
	 */
	 getWallet(userId: number): Promise<IWallet[]> {
		return this.walletModel.find({ user: userId }, 'amount cancelBy createdAt order walletType').sort({ createdAt: -1 }).exec();
	}
}
