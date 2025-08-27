import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import {
	TypeAdminSearch,
	TypeAdminPayload,
	DeleteResult,
	StatusPayload
} from 'src/shared/classes';
import { IType, ISequence } from 'src/shared/models';
import {
	createSlug,
	validatePageQuery,
	validateLimitQuery,
	validateSortOrder
} from 'src/shared/util';

/**
 * Type Service
 */
@Injectable()
export class TypeAdminService {
	/**
   * Constructor
	 * @param typeModel
	 * @param sequenceModel
   */
  constructor(
		@InjectModel("Type") private readonly typeModel: Model<IType>,
		@InjectModel("Sequence") private readonly sequenceModel: Model<ISequence>,
	) {}

	/**
	* Get all type
	* @param payload
	* @return IType[] - type list
	*/
	getAll(payload: TypeAdminSearch): Promise<IType[]> {
		const skip = payload.page * payload.limit;
		let filter = { };
		if (payload.title) filter['title'] = { $regex: payload.title, $options: 'i' };
		let sort = {};
		sort[payload.sortBy] = payload.orderBy;

		return this.typeModel.find(filter, 'title slug active popular').skip(skip).limit(payload.limit).sort(sort).exec();
	}

	/**
	* Count all type
	* @param payload
	* @return Number - Count of type
	*/
	countAll(payload: TypeAdminSearch): Promise<number> {
		let filter = { };
		if (payload.title) filter['title'] = { $regex: payload.title, $options: 'i' };
		return this.typeModel.countDocuments(filter).exec();
	}

	/**
	* Get all type
	* @return IType[] - type list
	*/
	getAllList(): Promise<IType[]> {
		return this.typeModel.find({}, 'title').exec();
	}

	/**
	* Get type by type id
	* @param typeId
	* @return IType - Type detail
	*/
	getById(typeId: number): Promise<IType> {
		return this.typeModel.findOne({ _id: typeId }, 'title image slug active popular').exec();
	}

	/**
	* Create type
	* @param payload
	* @return IType - Type detail
	*/
	async create(payload: TypeAdminPayload): Promise<IType> {
		const data = { ...payload };
		const count = await this._getTypeId();

		data['_id'] = count.value;
		data['slug'] = createSlug(payload.title);
		return this.typeModel.create(data);
	}

	/**
	* Update type by type id
	* @param typeId
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	update(typeId: number, payload: TypeAdminPayload): Promise<UpdateWriteOpResult> {
		return this.typeModel.updateOne({ _id: typeId }, payload).exec();
	}

	/**
	* Delete type by type id
	* @param typeId
	* @return DeleteResult - delete document
	*/
	delete(typeId: number): Promise<DeleteResult> {
		return this.typeModel.deleteOne({ _id: typeId }).exec();
	}

	/**
	* Update type status by type id
	* @param typeId
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	updateStatus(typeId: number, payload: StatusPayload): Promise<UpdateWriteOpResult> {
		return this.typeModel.updateOne({ _id: typeId }, payload).exec();
	}

	/**
	 * Get Type Id
	 * @returns
	 */
	private _getTypeId(): Promise<ISequence> {
		return this.sequenceModel.findOneAndUpdate({ "_id": "TYPE" }, { $inc: { "value": 1 } }, { new: true }).exec();
	}

	/**
	 * Validate type query parameters
	 * @param query
	 */
    public async validateAdminQuery(query: TypeAdminSearch): Promise<TypeAdminSearch>  {
		const search: TypeAdminSearch = {};
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
