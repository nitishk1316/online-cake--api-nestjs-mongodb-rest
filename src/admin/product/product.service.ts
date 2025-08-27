import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import {
	ProductAdminSearch,
	ProductPayload,
	DeleteResult,
	StatusPayload,
	NotificationType,
	ImportProductPayload
} from 'src/shared/classes';
import { IProduct, ISequence } from 'src/shared/models';
import { EventGateway } from 'src/shared/services';
import {
	createSlug,
	validatePageQuery,
	validateLimitQuery,
	validateSortOrder
} from 'src/shared/util';

/**
 * Product Service
 */
@Injectable()
export class ProductAdminService {
	/**
   * Constructor
	 * @param productModel
	 * @param sequenceModel
	 * @param eventGateway
	 */
  constructor(
		@InjectModel("Product") private readonly productModel: Model<IProduct>,
		@InjectModel("Sequence") private readonly sequenceModel: Model<ISequence>,
		private readonly eventGateway: EventGateway,
	) {}

	/**
	* Get all product
	* @param payload
	* @return IProduct[] - Product list
	*/
	getAll(payload: ProductAdminSearch): Promise<IProduct[]> {
		const skip = payload.page * payload.limit;
		let filter = {};
		if (payload.title) filter['title'] = { $regex: payload.title, $options: 'i' };
		if (payload.type) filter['type'] = payload.type;

		let sort = {};
		sort[payload.sortBy] = payload.orderBy;

		return this.productModel.find(filter, 'title active popular type').skip(skip)
			.limit(payload.limit).sort(sort).exec();
	}

	/**
	* Count all product
	* @param payload
	* @return Number - Count of product
	*/
	countAll(payload: ProductAdminSearch): Promise<number> {
		let filter = {};
		if (payload.title) filter['title'] = { $regex: payload.title, $options: 'i' };
		if (payload.type) filter['type'] = payload.type;
		return this.productModel.countDocuments(filter).exec();
	}

	/**
	* Get product detail by id
	* @param productId
	* @return IProduct - Product detail
	*/
	getById(productId: number): Promise<IProduct> {
		return this.productModel.findOne({ _id: productId }, '-createdAt -updatedAt -__v').exec();
	}

	/**
	* Create product
	* @param payload
	* @return IProduct - Product detail
	*/
	async create(payload: ProductPayload): Promise<IProduct> {
		const data = { ...payload };
		const count = await this._getProductId();

		data['_id'] = count.value;
		data['slug'] = createSlug(payload.title);
		return this.productModel.create(data);
	}

	/**
	* Update product by id
	* @param productId
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	update(productId: number, payload: ProductPayload): Promise<UpdateWriteOpResult> {
		return this.productModel.updateOne({ _id: productId }, payload).exec();
	}

	/**
	* Delete product by id
	* @param productId
	* @return DeleteResult - delete document
	*/
	delete(productId: number): Promise<DeleteResult> {
		return this.productModel.deleteOne({ _id: productId }).exec();
	}

	/**
	* Update product status by id
	* @param productId
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	updateStatus(productId: number, payload: StatusPayload): Promise<UpdateWriteOpResult> {
		return this.productModel.updateOne({ _id: productId }, payload).exec();
	}

	/**
	* Get all out of stock product where variant stock is 0
	* @param payload
	* @return IProduct[] - Product list
	*/
	getOFS(payload: ProductAdminSearch): Promise<IProduct[]> {
		const skip = payload.page * payload.limit;
		const filter = { variants: { $elemMatch: { stock: { $lte: 0 } } } };
		return this.productModel.find(filter, 'title active variants.capacity').skip(skip).limit(payload.limit).exec();
	}

	/**
	* Count all out of stock product where variant stock is 0
	* @return Number - Count of out of stock product
	*/
	countOFS(): Promise<number> {
		const filter = { variants: { $elemMatch: { stock: { $lte: 0 } } } };
		return this.productModel.countDocuments(filter).exec();
	}

	/**
	* Get all product for exports
	* @param limit
	* @return IProduct[] - Product list
	*/
	getAllExports(limit: number): Promise<IProduct[]> {
		let filter = {};
		return this.productModel.find(filter, 'title desc images active type variants').skip(0).limit(limit).exec();
	}

	/**
	 * Decrese stock when ordered
	 * @param productId
	 * @param qty
	 * @return UpdateWriteOpResult - update document
	 */
	decrementStock(productId: number, qty: number): Promise<UpdateWriteOpResult> {
		return this.productModel.updateOne({ _id: productId }, { $inc: { stock : qty * -1 }}).exec();
	}

	/**
	 * Increment stock when ordered
	 * @param productId
	 * @param qty
	 * @return UpdateWriteOpResult - update document
	 */
	incrementStock(productId: number, qty: number): Promise<UpdateWriteOpResult> {
		return this.productModel.updateOne({ _id: productId }, { $inc: { stock: qty * 1 }}).exec();
	}

	/**
	 * Validate product query parameters
	 * @param query
	 */
    public async validateAdminQuery(query: ProductAdminSearch): Promise<ProductAdminSearch>  {
		const search: ProductAdminSearch = {};
		search.page = validatePageQuery(query.page);
		search.limit = validateLimitQuery(query.limit);
		search.orderBy = validateSortOrder(query.orderBy);

		let sortBy = 'createdAt';
		if (query.sortBy) {
			if (query.sortBy == 'active') sortBy = 'active';
		}
		search.sortBy = sortBy;

		if (query.title) search.title = query.title;
		if (query.type) search.type = isNaN(+query.type) ? null : query.type;
		return search;
	}

	/**
	* Get all product for exports
	* @param limit
	* @return IProduct[] - Product list
	*/
	async createAndUpdate(updateList: ImportProductPayload[], createList: ProductPayload[]) {
		for (var i = 0; i < updateList.length; i++) {
			const p = updateList[i];
			await this.update(p._id, p);
		}
		for (var i = 0; i < createList.length; i++) {
			let p = createList[i];
			const count = await this._getProductId();
			p['_id'] = count.value;
			p['slug'] = createSlug(p.title);
			await this.create(p);
		}
		this.eventGateway.setNotification({ notifyType: NotificationType.IMPORT })
	}

	/**
	 * Get product id
	 * @returns
	 */
	private _getProductId(): Promise<ISequence> {
		return this.sequenceModel.findOneAndUpdate({ "_id": "PRODUCT" }, { $inc: { "value": 1 } }, { new: true }).exec();
	}
}
