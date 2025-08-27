import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Deal } from 'src/shared/classes';
import { IDeal } from 'src/shared/models';

/**
 * Deal Service
 */
@Injectable()
export class DealService {
	/**
   * Constructor
	 * @param dealModel
	 */
  constructor(
		@InjectModel("Deal") private readonly dealModel: Model<IDeal>,
	) {}

	/**
	 * Get all deal for user
	 * @return IDeal[] - array of deal
	 */
	getAllForUser(): Promise<Deal[]> {
		return this.dealModel.aggregate([
			{ $match : { active : true } },
			{ $lookup: { from: "types", localField: "type", foreignField: "_id", as: "type" } },
			{ $unwind: '$type' },
			{ $project: { _id: 1, title: 1, image: 1, slug: 1, type: { _id: 1, title: 1 }, }
		}
	 ]).exec();
	}

	/**
	 * Get deal by deal id
	 * @param dealId
	 * @return IDeal - deal detail
	 */
	getById(dealId: number): Promise<IDeal> {
		return this.dealModel.findOne({ _id: dealId, active: true }, 'title image dealType value type').exec();
	}

	/**
	 * Get deal by deal id
	 * @param dealId
	 * @return IDeal - deal detail
	 */
	 getByIdInfo(dealId: number): Promise<Deal[]> {
		return this.dealModel.aggregate([
			{ $match : { _id: Number(dealId), active: true } },
			{ $lookup: { from: "types", localField: "type", foreignField: "_id", as: "type" } },
			{ $unwind: '$type' },
			{ $project: { _id: 1, title: 1, image: 1, slug: 1, type: { _id: 1, title: 1 }, },
		}
	 ]).exec();
	}
}