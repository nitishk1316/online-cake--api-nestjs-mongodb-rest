import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { IPage } from 'src/shared/models';
import { Model } from "mongoose";

/**
 * Page Service
 */
@Injectable()
export class PageService {
	/**
   * Constructor
   * @param pageModel
   */
  constructor(
    @InjectModel("Page") private readonly pageModel: Model<IPage>
	) {}

	/**
	 * Get page detail by url
	 * @param url
	 * @return IPage - page detail
	 */
	getByUrl(url: string): Promise<IPage> {
		return this.pageModel.findOne({ url: url, active: true }, 'title desc').exec();
	}
}
