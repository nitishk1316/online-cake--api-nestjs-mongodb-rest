import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import {
	DealAdminSearch,
	DealAdminPayload,
	DeleteResult,
	StatusPayload
} from 'src/shared/classes';
import { IDeal, ISequence } from 'src/shared/models';
import {
	validatePageQuery,
	validateLimitQuery,
	validateSortOrder,
	createSlug
} from 'src/shared/util';

/**
 * Deal Service
 */
@Injectable()
export class DealAdminService {
	/**
   * Constructor
	 * @param dealModel
	 * @param sequenceModel
	 */
  constructor(
		@InjectModel("Deal") private readonly dealModel: Model<IDeal>,
		@InjectModel("Sequence") private readonly sequenceModel: Model<ISequence>,
	) {}

	/**
	* Get all deal
	* @param payload
	* @return IDeal[] - array of deal
	*/
	getAll(payload: DealAdminSearch): Promise<IDeal[]> {
		const skip = payload.page * payload.limit;
		let filter = {};
		if (payload.title) filter['title'] = { $regex: payload.title, $options: 'i' };
		if (payload.dealType) filter['dealType'] = payload.dealType;

		let sort = {};
		sort[payload.sortBy] = payload.orderBy;
		return this.dealModel.find(filter, 'title active dealType value type').skip(skip).limit(payload.limit).sort(sort).exec();
	}

	/**
	* Count all deal
	* @param payload
	* @return Number - Count of deal
	*/
	countAll(payload: DealAdminSearch): Promise<number> {
		const skip = payload.page * payload.limit;
		let filter = {};
		if (payload.title) filter['title'] = { $regex: payload.title, $options: 'i' };
		if (payload.dealType) filter['dealType'] = payload.dealType;
		return this.dealModel.countDocuments(filter).exec();
	}

	/**
	* Get deal by deal id
	* @param dealId
	* @return IDeal - deal detail
	*/
	getById(dealId: number): Promise<IDeal> {
		return this.dealModel.findOne({ _id: dealId }, 'title image active dealType value type').exec();
	}

	/**
	* Create deal
	* @param payload
	* @return IDeal - deal detail
	*/
	async create(payload: DealAdminPayload): Promise<IDeal> {
		const data = { ...payload };
		const count = await this._getDealId();

		data['_id'] = count.value;
		data['slug'] = createSlug(payload.title);

		return this.dealModel.create(data);
	}

	/**
	* Update deal by deal id
	* @param dealId
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	update(dealId: number, payload: DealAdminPayload): Promise<UpdateWriteOpResult> {
		return this.dealModel.updateOne({ _id: dealId }, payload).exec();
	}

	/**
	* Delete deal by deal id
	* @param dealId
	* @return DeleteResult - delete document
	*/
	delete(dealId: number): Promise<DeleteResult> {
		return this.dealModel.deleteOne({ _id: dealId }).exec();
	}

	/**
	* Update deal status by deal id
	* @param dealId
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	updateStatus(dealId: number, payload: StatusPayload): Promise<UpdateWriteOpResult> {
		return this.dealModel.updateOne({ _id: dealId }, payload).exec();
	}

	/**
	 * Validate deal query parameters
	 * @param query
	 */
    public async validateAdminQuery(query: DealAdminSearch): Promise<DealAdminSearch>  {
		const search: DealAdminSearch = {};
		search.page = validatePageQuery(query.page);
		search.limit = validateLimitQuery(query.limit);
		search.orderBy = validateSortOrder(query.orderBy);

		let sortBy = 'createdAt';
		if (query.sortBy) {
			if (query.sortBy == 'active') sortBy = 'active';
		}
		search.sortBy = sortBy;

		if (query.title) search.title = query.title;
		if (query.dealType) search.dealType = query.dealType;
		return search;
	}

	/**
	 * Get deal id
	 * @returns
	 */
	private _getDealId(): Promise<ISequence> {
		return this.sequenceModel.findOneAndUpdate({ "_id": "DEAL" }, { $inc: { "value": 1 } }, { new: true }).exec();
	}
}
