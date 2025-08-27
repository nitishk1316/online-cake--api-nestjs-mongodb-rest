import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IType } from 'src/shared/models';

/**
 * Type Service
 */
@Injectable()
export class TypeService {
	/**
   * Constructor
	 * @param typeModel
   */
  constructor(
		@InjectModel("Type") private readonly typeModel: Model<IType>,
	) {}

	/**
	 * Get all active Cake
	 * @param payload
	 * @return IType[]
	 */
	 getAll(): Promise<IType[]> {
		let filter = { active: true };
		return this.typeModel.find(filter, 'title image slug').exec();
	}

	/**
	 * Get  by id
	 * @param payload
	 * @return IType
	 */
	getById(typeId: number): Promise<IType> {
		let filter = { active: true, _id: typeId };
		return this.typeModel.findOne(filter, 'title slug').exec();
	}

	/**
	 * Get all popular
	 * @return IType[]
	 */
	getAllPopular(): Promise<IType[]> {
		let filter = { active: true, popular: true };
		return this.typeModel.find(filter, 'title image slug').exec();
	}
}
