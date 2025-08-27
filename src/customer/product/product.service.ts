import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { IProduct } from 'src/shared/models';
import { DealAdmin, DealType, ProductSearch } from 'src/shared/classes';
import { Model, UpdateWriteOpResult } from "mongoose";

/**
 * Product Service
 */
@Injectable()
export class ProductService {
	/**
   * Constructor
	 * @param productModel
	 */
  constructor(
		@InjectModel("Product") private readonly productModel: Model<IProduct>,
	) {}

	/**
	 * Get all active product
	 * @param payload
	 * @return IProduct[] - Product list
	 */
	getAllActive(payload: ProductSearch): Promise<IProduct[]> {
		const skip = payload.page * payload.limit;
		let filter = { active: true };

		if (payload.search) filter['title'] = { $regex: payload.search, $options: 'i' };
		if (payload.type) filter['type'] = payload.type;
		if (payload.occasion) filter['occasion'] = payload.occasion;
		if (payload.flavour) filter['flavour'] = payload.flavour;

		return this.productModel.find(filter, 'title thumbnail variants slug').skip(skip).limit(payload.limit).exec();
	}

	/**
	* Count all active product
	* @param payload
	* @return Number - Count of product
	*/
	countAllActive(payload: ProductSearch): Promise<number> {
		let filter = { active: true };

		if (payload.search) filter['title'] = { $regex: payload.search, $options: 'i' };
		if (payload.type) filter['type'] = payload.type;
		if (payload.occasion) filter['occasion'] = payload.occasion;
		if (payload.flavour) filter['flavour'] = payload.flavour;

		return this.productModel.countDocuments(filter).exec();
	}

	/**
	 * Get product detail for user
	 * @param productId
	 * @return IProduct - Product detail
	 */
	getById(productId: number): Promise<IProduct> {
		return this.productModel.findOne({ _id: productId }, '-createdAt -updatedAt -__v').exec();
	}

	/**
	 * Get products by ids
	 * @param productIds
	 * @return IProduct[] - Product list
	 */
	getByIds(productIds: number[]): Promise<IProduct[]> {
		return this.productModel.find({ _id: { $in: productIds } }, 'title thumbnail variants slug type flavour occasion active').exec();
	}

	/**
	 * Get All popular
	 * @return IProduct[]
	 */
	 getAllPopular(): Promise<IProduct[]> {
		return this.productModel.find({ }, 'title thumbnail variants slug ').sort({ updatedAt: -1 } ).skip(0).limit(12).exec();
	}

	/**
	 * Get products based on deak type
	 * @param deal
	 * @param payload
	 * @return IProduct[] - Product list
	 */
	getAllByDealType(deal: DealAdmin, payload: ProductSearch): Promise<IProduct[]> {
		const skip = payload.page * payload.limit;
		let filter = { active: true, type: deal.type };

		if (deal.dealType == DealType.UNDER)
			filter['variants'] = { $elemMatch: { sellingPrice: { $lte: deal.value } } };
		else if (deal.dealType == DealType.MIN_OFF)
			filter['variants'] = { $elemMatch: { discount: { $gte: deal.value } } };
		else if (deal.dealType == DealType.UPTO_OFF)
			filter['variants'] = { $elemMatch: { discount: { $lte: deal.value, $gte: 1 } } };

		return this.productModel.find(filter, 'title thumbnail variants slug').skip(skip).limit(payload.limit).exec();
	}

	/**
	 * Count products based on deal type
	* @param deal
	 * @param payload
	 * @return Number - Count of product
	 */
	countAllByDealType(deal: DealAdmin, payload: ProductSearch): Promise<number> {
		const skip = payload.page * payload.limit;
		let filter = { active: true, type: deal.type };

		if (deal.dealType == DealType.UNDER)
			filter['variants'] = { $elemMatch: { sellingPrice: { $lte: deal.value } } };
		else if (deal.dealType == DealType.MIN_OFF)
			filter['variants'] = { $elemMatch: { discount: { $gte: deal.value } } };
		else if (deal.dealType == DealType.UPTO_OFF)
			filter['variants'] = { $elemMatch: { discount: { $lte: deal.value, $gte: 1 } } };

		return this.productModel.countDocuments(filter).exec();
	}

	/**
	 * Decrese stock when ordered
	 * @param id
	 * @param sku
	 * @param qty
	 * @return UpdateWriteOpResult - update document
	 */
	decrementStock(id: number, sku: string, qty: number): Promise<UpdateWriteOpResult> {
		let filter = { _id: id, "variants.sku": sku };
		return this.productModel.updateOne(filter, { $inc: { "variants.$.stock": qty * -1 }}).exec();
	}
}
