import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { IPayMethod } from 'src/shared/models';
import { Model } from "mongoose";

/**
 * pay Method Service
 */
@Injectable()
export class PMService {
	/**
   * Constructor
   * @param pmModel
   */
  constructor(
    	@InjectModel("PayMethod") private readonly pmModel: Model<IPayMethod>
	) {}

	/**
	* Get all active pay method
	* @return IPayMethod[] - Pay method list
	*/
	getAllActive(): Promise<IPayMethod[]> {
		return this.pmModel.find({ active: true }, 'method').exec();
	}
}