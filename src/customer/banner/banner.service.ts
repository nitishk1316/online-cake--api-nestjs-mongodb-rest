import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { IBanner } from 'src/shared/models';

/**
 * Banner Service
 */
@Injectable()
export class BannerService {
	/**
   * Constructor
	 * @param bannerModel
   */
  constructor(
		@InjectModel("Banner") private readonly bannerModel: Model<IBanner>,
	) {}

	/**
	 * Get all active banner for user
	 * @param payload
	 * @return IBanner[] - array of banner
	 */
	getAllForUser(): Promise<IBanner[]> {
		let filter = { active: true };
		return this.bannerModel.find(filter, 'title image bannerType type link slug').exec();
	}
}
