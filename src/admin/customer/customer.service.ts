import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import {
	DeleteResult,
	DeliveryAdminSearch,
	DeliveryPayload,
	StatusPayload
} from 'src/shared/classes';
import { ISequence, IUser } from 'src/shared/models';
import {
	Roles,
	validateLimitQuery,
	validatePageQuery,
	validateSortOrder
} from 'src/shared/util';

/**
 * User Service
 */
@Injectable()
export class CustomerAdminService {
	/**
   * Constructor
	 * @param userModel
	 * @param sequenceModel
	 */
  constructor(
		@InjectModel("User") private readonly userModel: Model<IUser>,
		@InjectModel("Sequence") private readonly sequenceModel: Model<ISequence>,
	) {}

	/**
	* Get all user
	* @param payload
	* @param role
	* @return IUser[] - User list
	*/
	getAll(payload: DeliveryAdminSearch, role: string): Promise<IUser[]> {
		const skip = payload.page * payload.limit;
		let filter = { role: role };
		if (payload.email) {
			if(isNaN(+payload.email)) {
				filter['$or'] = [
					{ 'firstName': { $regex: payload.email, $options: 'i' } },
					{ 'lastName': { $regex: payload.email, $options: 'i' } },
					{ 'email': { $regex: payload.email, $options: 'i' } },
				]
			} else {
				filter['$or'] = [
					{ 'mobileNumber': +payload.email }
				]
			}
		}
		let sort = {};
		sort[payload.sortBy] = payload.orderBy;

		return this.userModel.find(filter, 'firstName lastName email mobileNumber createdAt orderPurchased orderDelivered active').sort(sort).skip(skip).limit(payload.limit).exec();
	}

	/**
	* Get all delivery list
	* @param payload
	* @return IUser[] - User list
	*/
	getDeliveryList(): Promise<IUser[]> {
		return this.userModel.find({ role: Roles.DELIVERY, active: true }, 'firstName lastName').exec();
	}

	/**
	* Count all user
	* @param payload
	* @param role
	* @return Number - Count of user
	*/
	countAll(payload: DeliveryAdminSearch, role: string): Promise<number> {
		let filter = { role: role };
		if (payload.email) {
			if(isNaN(+payload.email)) {
				filter['$or'] = [
					{ 'firstName': { $regex: payload.email, $options: 'i' } },
					{ 'lastName': { $regex: payload.email, $options: 'i' } },
					{ 'email': { $regex: payload.email, $options: 'i' } },
				]
			} else {
				filter['$or'] = [
					{ 'mobileNumber': +payload.email }
				]
			}
		}
		return this.userModel.countDocuments(filter).exec();
	}

	/**
	* Get user detail by id
	* @param customerId
	* @return IUser - user detail
	*/
	getById(customerId: number): Promise<IUser> {
		return this.userModel.findOne({ _id: customerId }).exec();
	}

	/**
	* Update user status
	* @param customerId
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	updateStatus(customerId: number, payload: StatusPayload): Promise<UpdateWriteOpResult> {
		return this.userModel.updateOne({ _id: customerId }, payload).exec();
	}

	/**
	* Delete user
	* @param customerId
	* @return DeleteResult - delete document
	*/
	delete(customerId: number): Promise<DeleteResult> {
		return this.userModel.deleteOne({ _id: customerId }).exec();
	}

	/**
	 * Validate user query parameters
	 * @param query
	 */
    public async validateAdminQuery(query: DeliveryAdminSearch): Promise<DeliveryAdminSearch>  {
		const search: DeliveryAdminSearch = {};
		search.page = validatePageQuery(query.page);
		search.limit = validateLimitQuery(query.limit);
		search.orderBy = validateSortOrder(query.orderBy);

		let sortBy = 'createdAt';
		if (query.sortBy) {
			if (query.sortBy == 'active') sortBy = 'active';
			if (query.sortBy == 'orderPurchased') sortBy = 'orderPurchased';
			if (query.sortBy == 'createdAt') sortBy = 'createdAt';
		}
		search.sortBy = sortBy;

		if (query.email) search.email = query.email;
		return search;
	}

	/**
	 * Update user purchase count
	 * @param customerId
	 * @return UpdateWriteOpResult - update document
	 */
	updateCancelPurchased(customerId: number): Promise<UpdateWriteOpResult> {
		return this.userModel.updateOne({ _id: customerId }, { $inc:  { orderPurchased: -1 } }).exec();
	}

	/**
	 * Get user detail by email or mobileNumber
	 * @param emailOrMobile
	 * @return IUser - user detail
	 */
	getByEmailOrMobile(email: string, mobileNumber: string): Promise<IUser> {
		let filter: any = { $or: [{ mobileNumber: mobileNumber }] };
		if (email) {
			email = email.toLowerCase();
			filter = { $or: [{ mobileNumber: mobileNumber }, { email: email }] };
		}
		return this.userModel.findOne(filter).exec();
	}

	/**
	* Get delivery detail by id
	* @param customerId
	* @return IUser - user detail
	*/
	getCustomerById(customerId: number): Promise<IUser> {
		return this.userModel.findOne({ _id: customerId, role: Roles.CUSTOMER }, 'firstName lastName email mobileNumber orderPurchased').exec();
	}

	/**
	* Get delivery detail by id
	* @param deliveryId
	* @return IUser - user detail
	*/
	getDeliveryById(deliveryId: number): Promise<IUser> {
		return this.userModel.findOne({ _id: deliveryId, role: Roles.DELIVERY }, 'firstName lastName email mobileNumber orderDelivered').exec();
	}

	/**
	 * Create user delivery
	 * @param payload
	 * @return IUser - user detail
	 */
	 async createDelivery(payload: DeliveryPayload): Promise<IUser> {
		const sequence = await this._getUserId();
		payload['_id'] = sequence.value;
		payload['role'] = Roles.DELIVERY;
		return this.userModel.create(payload);
	}

	/**
	 * Get coupon Id
	 * @returns
	 */
	 private _getUserId(): Promise<ISequence> {
		return this.sequenceModel.findOneAndUpdate({ "_id": "USER" }, { $inc: { "value": 1 } }, { new: true }).exec();
	}
}