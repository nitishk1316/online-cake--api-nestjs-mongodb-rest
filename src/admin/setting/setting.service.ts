import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import {
	StoreAdminPayload,
	DeliveryTaxAdminPayload,
	CurrencyAdminPayload
} from 'src/shared/classes';
import { ISetting } from 'src/shared/models';

/**
 * Setting Service
 */
@Injectable()
export class SettingAdminService {
	/**
   * Constructor
   * @param settingModel
   */
  constructor(
  	@InjectModel("Setting") private readonly settingModel: Model<ISetting>
	) {}

	/**
	* Get settings
	* @return ISetting - Setting object
	*/
	get(): Promise<ISetting> {
		return this.settingModel.findOne({ _id: 1 }, 'currency deliveryCharges tax taxType').exec();
	}

	/**
	* Get store settings
	* @return ISetting - Setting object
	*/
	getStore(): Promise<ISetting> {
		return this.settingModel.findOne({ _id: 1 }, 'storeName address email phoneNumber location').exec();
	}

	/**
	* Get delivery & tax
	* @return ISetting - Setting object
	*/
	getDeliveryTax(): Promise<ISetting> {
		return this.settingModel.findOne({ _id: 1 }, 'deliveryCharges minimumForFree taxType tax').exec();
	}

	/**
	* Get currency
	* @return ISetting - Setting object
	*/
	getCurrency(): Promise<ISetting> {
		return this.settingModel.findOne({ _id: 1 }, 'currency').exec();
	}

	/**
	* Update store settings
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	updateStore(payload: StoreAdminPayload): Promise<UpdateWriteOpResult> {
		return this.settingModel.updateOne({ _id: 1 }, payload).exec();
	}

	/**
	* Update delivery tax settings
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	updateDeliveryTax(payload: DeliveryTaxAdminPayload): Promise<UpdateWriteOpResult> {
		return this.settingModel.updateOne({ _id: 1 }, payload).exec();
	}

	/**
	* Update currency settings
	* @param payload
	* @return UpdateWriteOpResult - update document
	*/
	updateCurrency(payload: CurrencyAdminPayload): Promise<UpdateWriteOpResult> {
		return this.settingModel.updateOne({ _id: 1 }, { currency: payload }).exec();
	}
}
