import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import {
	BannerAdminSearch,
	BannerAdminPayload,
	DeleteResult,
	StatusPayload
} from 'src/shared/classes';
import { IBanner, ISequence } from 'src/shared/models';
import {
	validatePageQuery,
	validateLimitQuery,
	validateSortOrder,
	createSlug
} from 'src/shared/util';

/**
 * Banner Service
 */
@Injectable()
export class BannerAdminService {
	/**
   * Constructor
	 * @param bannerModel
	 * @param sequenceModel
	 */
  constructor(
		@InjectModel("Banner") private readonly bannerModel: Model<IBanner>,
		@InjectModel("Sequence") private readonly sequenceModel: Model<ISequence>,
	) {}

	/**
	* Get all banner
	* @param payload - banner search with pagination
	* @return IBanner[] - array of banner
	*/
	getAll(payload: BannerAdminSearch): Promise<IBanner[]> {
		const skip = payload.page * payload.limit;
		let filter = {};
		if (payload.title) filter['title'] = { $regex: payload.title, $options: 'i' };
		if (payload.bannerType) filter['bannerType'] = payload.bannerType;

		let sort = {};
		sort[payload.sortBy] = payload.orderBy;

		return this.bannerModel.find(filter, 'title bannerType active type link').skip(skip).limit(payload.limit).sort(sort).exec();
	}

	/**
	* Count all banner
	* @param payload
	* @return number - Count of banner
	*/
	countAll(payload: BannerAdminSearch): Promise<number> {
		const skip = payload.page * payload.limit;
		let filter = {};
		if (payload.title) filter['title'] = { $regex: payload.title, $options: 'i' };
		if (payload.bannerType) filter['bannerType'] = payload.bannerType;
		return this.bannerModel.countDocuments(filter).exec();
	}

	/**
	* Get banner by banner id
	* @param bannerId
	* @return IBanner - banner detail
	*/
	getById(bannerId: number): Promise<IBanner> {
		return this.bannerModel.findOne({ _id: bannerId }, 'title image bannerType type link active').exec();
	}

	/**
	* Create banner
	* @param payload
	* @return IBanner - banner detail
	*/
	async create(payload: BannerAdminPayload): Promise<IBanner> {
		const data = { ...payload };
		const count = await this._getBannerId();

		data['_id'] = count.value;
		data['slug'] = createSlug(payload.title);

		return this.bannerModel.create(data);
	}

	/**
	* Update banner by banner id
	* @param bannerId
	* @param payload
	* @return UpdateDTO - update document
	*/
	update(bannerId: number, payload: BannerAdminPayload): Promise<UpdateWriteOpResult> {
		return this.bannerModel.updateOne({ _id: bannerId }, payload).exec();
	}

	/**
	* Delete banner by banner id
	* @param bannerId
	* @return DeleteDTO - delete document
	*/
	delete(bannerId: number): Promise<DeleteResult> {
		return this.bannerModel.deleteOne({ _id: bannerId }).exec();
	}

	/**
	* Update banner status by banner id
	* @param bannerId
	* @param ayload
	* @return UpdateWriteOpResult - update document
	*/
	updateStatus(bannerId: number, payload: StatusPayload): Promise<UpdateWriteOpResult> {
		return this.bannerModel.updateOne({ _id: bannerId }, payload).exec();
	}

	/**
	* Validate banner query parameters
	* @param query
	 */
  public async validateAdminQuery(query: BannerAdminSearch): Promise<BannerAdminSearch>  {
		const search: BannerAdminSearch = {};
		search.page = validatePageQuery(query.page);
		search.limit = validateLimitQuery(query.limit);
		search.orderBy = validateSortOrder(query.orderBy);

		let sortBy = 'createdAt';
		if (query.sortBy) {
			if (query.sortBy == 'active') sortBy = 'active';
		}
		search.sortBy = sortBy;

		if (query.title) search.title = query.title;
		if (query.bannerType) search.bannerType = query.bannerType;
		return search;
	}

	/**
	 * Get Banner id
	 * @returns
	 */
	private _getBannerId(): Promise<ISequence> {
		return this.sequenceModel.findOneAndUpdate({ "_id": "BANNER" }, { $inc: { "value": 1 } }, { new: true }).exec();
	}
}
