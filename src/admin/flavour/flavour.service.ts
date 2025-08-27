import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import {
	FlavourAdminSearch,
	FlavourAdminPayload,
	DeleteResult,
	StatusPayload
} from 'src/shared/classes';
import { IFlavour, ISequence } from 'src/shared/models';
import {
	createSlug,
	validatePageQuery,
	validateLimitQuery,
	validateSortOrder
} from 'src/shared/util';

/**
 * Flavour Service
 */
@Injectable()
export class FlavourAdminService {
	/**
   * Constructor
	 * @param flavourModel
	 * @param sequenceModel
   */
  constructor(
		@InjectModel("Flavour") private readonly flavourModel: Model<IFlavour>,
		@InjectModel("Sequence") private readonly sequenceModel: Model<ISequence>,
	) {}

	/**
	* Get all flavour
	* @param payload
	* @return IFlavour[] - flavour list
	*/
	getAll(payload: FlavourAdminSearch): Promise<IFlavour[]> {
		const skip = payload.page * payload.limit;
		let filter = { };
		if (payload.title) filter['title'] = { $regex: payload.title, $options: 'i' };
		let sort = {};
		sort[payload.sortBy] = payload.orderBy;

		return this.flavourModel.find(filter, 'title slug active popular').skip(skip).limit(payload.limit).sort(sort).exec();
	}

	/**
	* Count all flavour
	* @param payload
	* @return Number - Count of flavour
	*/
	countAll(payload: FlavourAdminSearch): Promise<number> {
		let filter = { };
		if (payload.title) filter['title'] = { $regex: payload.title, $options: 'i' };
		return this.flavourModel.countDocuments(filter).exec();
	}

	/**
	* Get all flavour
	* @return IFlavour[] - flavour list
	*/
	getAllList(): Promise<IFlavour[]> {
		return this.flavourModel.find({}, 'title').exec();
	}

	/**
	* Get flavour by flavour id
	* @param flavourId
	* @return IFlavour - Flavour detail
	*/
	getById(flavourId: number): Promise<IFlavour> {
		return this.flavourModel.findOne({ _id: flavourId }, 'title image slug active popular').exec();
	}

	/**
	* Create flavour
	* @param payload
	* @return IFlavour - Flavour detail
	*/
	async create(payload: FlavourAdminPayload): Promise<IFlavour> {
		const data = { ...payload };
		const count = await this._getFlavourId();

		data['_id'] = count.value;
		data['slug'] = createSlug(payload.title);
		return this.flavourModel.create(data);
	}

	/**
	* Update flavour by flavour id
	* @param flavourId
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	update(flavourId: number, payload: FlavourAdminPayload): Promise<UpdateWriteOpResult> {
		return this.flavourModel.updateOne({ _id: flavourId }, payload).exec();
	}

	/**
	* Delete flavour by flavour id
	* @param flavourId
	* @return DeleteResult - delete document
	*/
	delete(flavourId: number): Promise<DeleteResult> {
		return this.flavourModel.deleteOne({ _id: flavourId }).exec();
	}

	/**
	* Update flavour status by flavour id
	* @param flavourId
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	updateStatus(flavourId: number, payload: StatusPayload): Promise<UpdateWriteOpResult> {
		return this.flavourModel.updateOne({ _id: flavourId }, payload).exec();
	}

	/**
	 * Get Flavour Id
	 * @returns
	 */
	private _getFlavourId(): Promise<ISequence> {
		return this.sequenceModel.findOneAndUpdate({ "_id": "FLAVOUR" }, { $inc: { "value": 1 } }, { new: true }).exec();
	}

	/**
	 * Validate flavour query parameters
	 * @param query
	 */
    public async validateAdminQuery(query: FlavourAdminSearch): Promise<FlavourAdminSearch>  {
		const search: FlavourAdminSearch = {};
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
