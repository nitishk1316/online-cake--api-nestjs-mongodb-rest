import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import {
	OccasionAdminSearch,
	OccasionAdminPayload,
	DeleteResult,
	StatusPayload
} from 'src/shared/classes';
import { IOccasion, ISequence } from 'src/shared/models';
import {
	createSlug,
	validatePageQuery,
	validateLimitQuery,
	validateSortOrder
} from 'src/shared/util';

/**
 * Occasion Service
 */
@Injectable()
export class OccasionAdminService {
	/**
   * Constructor
	 * @param occasionModel
	 * @param sequenceModel
   */
  constructor(
		@InjectModel("Occasion") private readonly occasionModel: Model<IOccasion>,
		@InjectModel("Sequence") private readonly sequenceModel: Model<ISequence>,
	) {}

	/**
	* Get all occasion
	* @param payload
	* @return IOccasion[] - occasion list
	*/
	getAll(payload: OccasionAdminSearch): Promise<IOccasion[]> {
		const skip = payload.page * payload.limit;
		let filter = { };
		if (payload.title) filter['title'] = { $regex: payload.title, $options: 'i' };
		let sort = {};
		sort[payload.sortBy] = payload.orderBy;

		return this.occasionModel.find(filter, 'title slug active popular').skip(skip).limit(payload.limit).sort(sort).exec();
	}

	/**
	* Count all occasion
	* @param payload
	* @return Number - Count of occasion
	*/
	countAll(payload: OccasionAdminSearch): Promise<number> {
		let filter = { };
		if (payload.title) filter['title'] = { $regex: payload.title, $options: 'i' };
		return this.occasionModel.countDocuments(filter).exec();
	}

	/**
	* Get all occasion
	* @return IOccasion[] - occasion list
	*/
	getAllList(): Promise<IOccasion[]> {
		return this.occasionModel.find({}, 'title').exec();
	}

	/**
	* Get occasion by occasion id
	* @param occasionId
	* @return IOccasion - Occasion detail
	*/
	getById(occasionId: number): Promise<IOccasion> {
		return this.occasionModel.findOne({ _id: occasionId }, 'title image slug active popular').exec();
	}

	/**
	* Create occasion
	* @param payload
	* @return IOccasion - Occasion detail
	*/
	async create(payload: OccasionAdminPayload): Promise<IOccasion> {
		const data = { ...payload };
		const count = await this._getOccasionId();

		data['_id'] = count.value;
		data['slug'] = createSlug(payload.title);
		return this.occasionModel.create(data);
	}

	/**
	* Update occasion by occasion id
	* @param occasionId
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	update(occasionId: number, payload: OccasionAdminPayload): Promise<UpdateWriteOpResult> {
		return this.occasionModel.updateOne({ _id: occasionId }, payload).exec();
	}

	/**
	* Delete occasion by occasion id
	* @param occasionId
	* @return DeleteResult - delete document
	*/
	delete(occasionId: number): Promise<DeleteResult> {
		return this.occasionModel.deleteOne({ _id: occasionId }).exec();
	}

	/**
	* Update occasion status by occasion id
	* @param occasionId
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	updateStatus(occasionId: number, payload: StatusPayload): Promise<UpdateWriteOpResult> {
		return this.occasionModel.updateOne({ _id: occasionId }, payload).exec();
	}

	/**
	 * Get Occasion Id
	 * @returns
	 */
	private _getOccasionId(): Promise<ISequence> {
		return this.sequenceModel.findOneAndUpdate({ "_id": "OCCASION" }, { $inc: { "value": 1 } }, { new: true }).exec();
	}

	/**
	 * Validate occasion query parameters
	 * @param query
	 */
    public async validateAdminQuery(query: OccasionAdminSearch): Promise<OccasionAdminSearch>  {
		const search: OccasionAdminSearch = {};
		search.page = validatePageQuery(query.page);
		search.limit = validateLimitQuery(query.limit);
		search.orderBy = validateSortOrder(query.orderBy);

		let sortBy = 'createdAt';
		if (query.sortBy) {
			if (query.sortBy == 'active') sortBy = 'active';
		}
		search.sortBy = sortBy;

		if (query.title) search.title = query.title;
		return search;
	}
}
