import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IFlavour } from 'src/shared/models';

/**
 * Flavour Service
 */
@Injectable()
export class FlavourService {
	/**
   * Constructor
	 * @param flavourModel
   */
  constructor(
		@InjectModel("Flavour") private readonly flavourModel: Model<IFlavour>,
	) {}

	/**
	 * Get all active flavour
	 * @param payload
	 * @return IFlavour[]
	 */
	getAll(): Promise<IFlavour[]> {
		let filter = { active: true };
		return this.flavourModel.find(filter, 'title image slug').exec();
	}

	/**
	 * Get  by id
	 * @param payload
	 * @return IFlavour
	 */
	getById(flavourId: number): Promise<IFlavour> {
		let filter = { active: true, _id: flavourId };
		return this.flavourModel.findOne(filter, 'title slug').exec();
	}

	/**
	 * Get all popular
	 * @return IFlavour[]
	 */
	getAllPopular(): Promise<IFlavour[]> {
		let filter = { active: true, popular: true };
		return this.flavourModel.find(filter, 'title image slug').exec();
	}
}
