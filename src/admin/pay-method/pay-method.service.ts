import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import { StatusPayload } from 'src/shared/classes';
import { IPayMethod } from 'src/shared/models';

/**
 * pay Method Service
 */
@Injectable()
export class PMAdminService {
	/**
   * Constructor
   * @param pmModel
   */
  constructor(
  	@InjectModel("PayMethod") private readonly pmModel: Model<IPayMethod>
	) {}

	/**
	* Get all pay method
	* @return IPayMethod[] - Pay method list
	*/
	getAll(): Promise<IPayMethod[]> {
		return this.pmModel.find({}, 'method active').exec();
	}

	/**
	* Get pay method by method
	* @param method - pay method
	* @return IPayMethod - pay method detail
	*/
	getByMethod(method: string): Promise<IPayMethod> {
		return this.pmModel.findOne({ method: method }).exec();
	}

	/**
	* Update pay method status by method
	* @param method - pay method
	* @param payload
	* @return UpdateDTO - update document
	*/
	updateStatus(method: string, payload: StatusPayload): Promise<UpdateWriteOpResult> {
		return this.pmModel.updateOne({ method: method }, payload).exec();
	}
}
