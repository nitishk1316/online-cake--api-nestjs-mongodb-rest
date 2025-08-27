import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { ISetting } from 'src/shared/models';
import { Model } from "mongoose";

/**
 * Setting Service
 */
@Injectable()
export class SettingService {
	/**
   * Constructor
   * @param settingModel
   */
  constructor(
    @InjectModel("Setting") private readonly settingModel: Model<ISetting>
	) {}

	/**
	 * Get settings for user
	 * @return ISetting - Setting object
	 */
	getForUser(): Promise<ISetting> {
		return this.settingModel.findOne({ _id: 1 }, 'storeName address email phoneNumber minimumForFree location currency deliveryCharges').exec();
	}

	/**
	 * Get settings for order
	 * @return ISetting - Setting object
	 */
	getForOrder(): Promise<ISetting> {
		return this.settingModel.findOne({ _id: 1 }).exec();
	}
}
