import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import { Geometry } from 'src/shared/classes';
import { IDeliveryCoverage } from 'src/shared/models';

/**
 * Delivery Coverage Service
 */
@Injectable()
export class DCAdminService {
	/**
   * Constructor
   * @param dcModal
   */
  constructor(
    	@InjectModel("DeliveryCoverage") private readonly dcModal: Model<IDeliveryCoverage>
	) {}

/**
	* Get delivery coverage
	* @return DeliveryCoverage - Delivery Coverage
	*/
	getById(): Promise<IDeliveryCoverage> {
		return this.dcModal.findOne({ _id: 1 }, 'name geometry').exec();
	}

	/**
	* Update delivery coverage
	@ @param payload
	* @return UpdateWriteOpResult - update document
	*/
	update(payload: Geometry): Promise<UpdateWriteOpResult> {
		return this.dcModal.updateOne({ _id: 1 }, { geometry: payload }).exec();
	}
}
