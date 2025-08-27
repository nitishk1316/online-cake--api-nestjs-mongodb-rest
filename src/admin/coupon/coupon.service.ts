import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import {
	CouponAdminSearch,
	CouponAdminPayload,
	DeleteResult,
	StatusPayload
} from 'src/shared/classes';
import { ICoupon, ISequence } from 'src/shared/models';
import { validatePageQuery, validateLimitQuery, validateSortOrder } from 'src/shared/util';

/**
 * Coupon Service
 */
@Injectable()
export class CouponAdminService {
	/**
   * Constructor
	 * @param couponModel
	 * @param sequenceModel
	 */
  constructor(
		@InjectModel("Coupon") private readonly couponModel: Model<ICoupon>,
		@InjectModel("Sequence") private readonly sequenceModel: Model<ISequence>,
	) {}

	/**
	* Get all coupon
	* @param payload
	* @return ICoupon[] - coupon list
	*/
	getAll(payload: CouponAdminSearch): Promise<ICoupon[]> {
		const skip = payload.page * payload.limit;
		let filter = {};
		if (payload.title) filter['code'] = { $regex: payload.title, $options: 'i' };
		if (payload.couponType) filter['couponType'] = payload.couponType;
		if (payload.type) filter['type'] = payload.type;

		let sort = {};
		sort[payload.sortBy] = payload.orderBy;

		return this.couponModel.find(filter, 'code discount couponType startDate endDate type active').skip(skip).limit(payload.limit).sort(sort).exec();
	}

	/**
	* Count all coupon
	* @param payload
	* @return Number - Count of coupon
	*/
	countAll(payload: CouponAdminSearch): Promise<number> {
		let filter = {};
		if (payload.title) filter['code'] = { $regex: payload.title, $options: 'i' };
		if (payload.couponType) filter['couponType'] = payload.couponType;
		if (payload.type) filter['type'] = payload.type;
		return this.couponModel.countDocuments(filter).exec();
	}

	/**
	* Get coupon by coupon id
	* @param couponId
	* @return ICoupon - coupon detail
	*/
	getById(couponId: number): Promise<ICoupon> {
		return this.couponModel.findOne({ _id: couponId }).exec();
	}

	/**
	* Create coupon
	* @param payload
	* @return ICoupon - coupon detail
	*/
	async create(payload: CouponAdminPayload): Promise<ICoupon> {
		const data = { ...payload };
		const count = await this._getCouponId();
		data['_id'] = count.value;

		return this.couponModel.create(data);
	}

	/**
	* Update coupon by coupon id
	* @param couponId
	* @param payload
	* @return UpdateWriteOpResult -  update document
	*/
	update(couponId: number, payload: CouponAdminPayload): Promise<UpdateWriteOpResult> {
		return this.couponModel.updateOne({ _id: couponId }, payload).exec();
	}

	/**
	* Delete coupon by coupon id
	* @param couponId
	* @return DeleteResult - delete document
	*/
	delete(couponId: number): Promise<DeleteResult> {
		return this.couponModel.deleteOne({ _id: couponId }).exec();
	}

	/**
	* Update coupon status by coupon id
	* @param couponId
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	updateStatus(couponId: number, payload: StatusPayload): Promise<UpdateWriteOpResult> {
		return this.couponModel.updateOne({ _id: couponId }, payload).exec();
	}

	/**
	 * Validate coupon query parameters
	 * @param query
	 */
    public async validateAdminQuery(query: CouponAdminSearch): Promise<CouponAdminSearch>  {
		const search: CouponAdminSearch = {};
		search.page = validatePageQuery(query.page);
		search.limit = validateLimitQuery(query.limit);
		search.orderBy = validateSortOrder(query.orderBy);

		let sortBy = 'createdAt';
		if (query.sortBy) {
			if (query.sortBy == 'active') sortBy = 'active';
		}
		search.sortBy = sortBy;

		if (query.title) search.title = query.title;
		if (query.couponType) search.couponType = query.couponType;
		if (query.type) search.type = isNaN(+query.type) ? null : query.type;
		return search;
	}

	/**
	 * Get coupon Id
	 * @returns
	 */
	private _getCouponId(): Promise<ISequence> {
		return this.sequenceModel.findOneAndUpdate({ "_id": "COUPON" }, { $inc: { "value": 1 } }, { new: true }).exec();
	}
}
