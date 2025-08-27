import { Injectable } from '@nestjs/common';
import { InjectModel } from "@nestjs/mongoose";
import { Model, UpdateWriteOpResult } from "mongoose";
import { PagePayload, StatusPayload } from 'src/shared/classes';
import { IPage } from 'src/shared/models';

/**
 * Page Service
 */
@Injectable()
export class PageAdminService {
	/**
   * Constructor
   * @param pageModel
   */
	constructor(
		@InjectModel("Page") private readonly pageModel: Model<IPage>
	) {}

	/**
	 * Get all pages
	 * @return IPage[] - page list
	 */
	getAll(): Promise<IPage[]> {
		return this.pageModel.find({}, 'title url active').exec();
	}

	/**
	 * Get page by page id
	 * @param pageId
	 * @return IPage - page detail
	 */
	getById(pageId: string): Promise<IPage> {
		return this.pageModel.findById(pageId, 'title desc active').exec();
	}

	/**
	 * Update page by page id
	 * @param pageId
	 * @param payload
	 * @return UpdateWriteOpResult - update document
	 */
	update(pageId: string, payload: PagePayload): Promise<UpdateWriteOpResult> {
		return this.pageModel.updateOne({ _id: pageId }, payload).exec();
	}

	/**
	 * Update page status by page id
	 * @param pageId
	 * @param payload
	 * @return UpdateWriteOpResult - update document
	 */
	updateStatus(pageId: string, payload: StatusPayload): Promise<UpdateWriteOpResult> {
		return this.pageModel.updateOne({ _id: pageId }, payload).exec();
	}
}
