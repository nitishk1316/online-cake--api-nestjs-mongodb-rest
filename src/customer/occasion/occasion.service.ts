import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IOccasion } from 'src/shared/models';

/**
 * Occasion Service
 */
@Injectable()
export class OccasionService {
	/**
   * Constructor
	 * @param occasionModel
   */
  constructor(
		@InjectModel("Occasion") private readonly occasionModel: Model<IOccasion>,
	) {}

	/**
	 * Get all active flavour
	 * @param payload
	 * @return IOccasion[]
	 */
	getAll(): Promise<IOccasion[]> {
		let filter = { active: true };
		return this.occasionModel.find(filter, 'title image slug').exec();
	}

	/**
	 * Get  by id
	 * @param payload
	 * @return IOccasion
	 */
	getById(occasionId: number): Promise<IOccasion> {
		let filter = { active: true, _id: occasionId };
		return this.occasionModel.findOne(filter, 'title slug').exec();
	}

	/**
	 * Get all popular
	 * @return IOccasion[]
	 */
	getAllPopular(): Promise<IOccasion[]> {
		let filter = { active: true, popular: true };
		return this.occasionModel.find(filter, 'title image slug').exec();
	}
}
