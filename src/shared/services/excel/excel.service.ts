import { Injectable } from '@nestjs/common';
import {
	ProductAdminDetail,
	NotificationPayload,
	NotificationType,
	ProductPayload,
	ImportProductPayload,
	VariantPayload
} from 'src/shared/classes';
import { createSKU } from 'src/shared/util/shared-util';
import { EventGateway } from '../event/event.gateway';
import { MyLoggerService } from '../mylogger/mylogger.service';
import { UploadService } from '../upload/upload.service';
const Excel = require('exceljs');
const appRoot = require('app-root-path');
const fs = require('fs');
const ITEMS = "Items";

/**
 * Excel Service
 */
@Injectable()
export class ExcelService {
	/**
	 * Constructor
	 * @param uploadService
	 * @param eventGateway
	 * @param logger
	 */
	constructor(
		private readonly uploadService: UploadService,
		private readonly eventGateway: EventGateway,
		private readonly logger: MyLoggerService,
	) {
	}

	/**
	 * Excel sheet header rows
	 */
	public async getHeaders(): Promise<any> {
		let columns = [
			{ header: 'Product Id', key: 'id', width: 16 },
			{ header: 'Title', key: 'title', width: 32 },
			{ header: 'Description', key: 'desc', width: 48 },
			{ header: 'Cake Type', key: 'type', width: 16 },
			{ header: 'Sub Category', key: 'subCategory', width: 16 },
			{ header: 'Image Url-1', key: 'image1', width: 48 },
			{ header: 'Image Url-2', key: 'image2', width: 48 },
			{ header: 'Image Url-3', key: 'image3', width: 48 },
			{ header: 'Image Url-4', key: 'image4', width: 48 },
			{ header: 'Image Url-5', key: 'image5', width: 48 },
			{ header: 'SKU-1', key: 'sku1', width: 16 },
			{ header: 'Capacity-1', key: 'capacity1', width: 16 },
			{ header: 'Original Price-1', key: 'originalPrice1', width: 16 },
			{ header: 'Selling Price-1', key: 'sellingPrice1', width: 16 },
			{ header: 'Stock-1', key: 'stock1', width: 16 },
			{ header: 'SKU-2', key: 'sku2', width: 16 },
			{ header: 'Capacity-2', key: 'capacity2', width: 16 },
			{ header: 'Original Price-2', key: 'originalPrice2', width: 16 },
			{ header: 'Selling Price-2', key: 'sellingPrice2', width: 16 },
			{ header: 'Stock-2', key: 'stock2', width: 16 },
			{ header: 'SKU-3', key: 'sku3', width: 16 },
			{ header: 'Capacity-3', key: 'capacity3', width: 16 },
			{ header: 'Original Price-3', key: 'originalPrice3', width: 16 },
			{ header: 'Selling Price-3', key: 'sellingPrice3', width: 16 },
			{ header: 'Stock-3', key: 'stock3', width: 16 },
			{ header: 'SKU-4', key: 'sku4', width: 16 },
			{ header: 'Capacity-4', key: 'capacity4', width: 16 },
			{ header: 'Original Price-4', key: 'originalPrice4', width: 16 },
			{ header: 'Selling Price-4', key: 'sellingPrice4', width: 16 },
			{ header: 'Stock-4', key: 'stock4', width: 16 },
			{ header: 'SKU-5', key: 'sku5', width: 16 },
			{ header: 'Capacity-5', key: 'capacity5', width: 16 },
			{ header: 'Original Price-5', key: 'originalPrice5', width: 16 },
			{ header: 'Selling Price-5', key: 'sellingPrice5', width: 16 },
			{ header: 'Stock-5', key: 'stock5', width: 16 },
		];
		return columns;
	}

	/**
	 * Export products
	 * @param products
	 * @return boolean
	 */
	public async exportProducts(products: ProductAdminDetail[]): Promise<void> {
		var workbook = new Excel.Workbook();
		let sheet = workbook.addWorksheet(ITEMS);
		sheet.columns = await this.getHeaders();

		(await products).map(async p => {
			let obj = {
				id: p._id,
				title: p.title,
				desc: p.desc,
				type: p.type,
			}
			for (let i = 1; i <= p.images.length; i++) {
				obj['image' + i] = p.images[i-1];
				if (i == 5) break;
			}

			var i = 1;
			for (let q of p.variants) {
				obj['sku' + i] = q.sku;
				obj['capacity' + i] = q.capacity;
				obj['originalPrice' + i] = q.originalPrice;
				obj['sellingPrice' + i] = q.sellingPrice;
				obj['stock' + i] = q.stock;
				i++;
			};
			await sheet.addRow(obj);
		});

		const fileName = 'items_exports.xlsx';
		await workbook.xlsx.writeFile(fileName);
		let path = appRoot.path + "/" + fileName;
		let base64 = await fs.readFileSync(path, { encoding: 'base64' });
		let uploadedFile = await this.uploadService.uploadFile(base64, fileName);

		const notiifyPayload: NotificationPayload = {
			url: uploadedFile.url,
			notifyType: NotificationType.EXPORT,
			fileId: uploadedFile.fileId
		};
		this.eventGateway.setNotification(notiifyPayload);
		await fs.unlinkSync(path);
	}

	/**
	 * Import products
	 * @param file
	 */
	public async importProducts(file: { buffer: any; }) {
		try {
			var workbook = new Excel.Workbook();
			await workbook.xlsx.load(file.buffer);
			let ws = workbook.getWorksheet(ITEMS);
			let createList: ProductPayload[] = [];
			let updateList: ImportProductPayload[] = [];

			await ws.eachRow((row, rowNumber) => {
				if (rowNumber == 1) return;
				let data: ImportProductPayload  = {
					_id: row.getCell(1).value,
					title: row.getCell(2).value,
					desc: row.getCell(3).value,
					type: row.getCell(4).value,
					images: [],
					variants: []
				}

				for(let i = 6; i < 11; i++) {
					if (row.getCell(i).value) data.images.push(row.getCell(i).value);
				};
				if (!row.getCell(1).value) data.thumbnail = data.images[0];

				let index = 11;
				while (row.getCell(index + 1).value != null) {
					const capacity = row.getCell(index + 1).value || '';
					const originalPrice = row.getCell(index + 2).value || 0;
					let discount = 0;

					let sellingPrice = row.getCell(index + 3).value || 0;
					if (sellingPrice > originalPrice) sellingPrice = originalPrice;

					if (originalPrice == sellingPrice)
						discount = 0;
					else
						discount = Number((((originalPrice - sellingPrice) / originalPrice) * 100).toFixed(0));

					const stock = row.getCell(index + 4).value || 0;
					const sku = row.getCell(index).value || createSKU(data.title, capacity);
					const variant: VariantPayload = {
						sku: sku,
						capacity: capacity,
						originalPrice: originalPrice,
						sellingPrice: sellingPrice,
						stock: stock,
						discount: discount
					};
					data.variants.push(variant);
					index += 5;
				}

				if (row.getCell(1).value) updateList.push(data);
				else createList.push(data);
			});
			return { updateList, createList };
		} catch (e) {
			this.logger.error(e);
		}
	}

	/**
	 * Create template for import
	 * @return object - file url
	 */
	public async createImportTemplate(): Promise<any> {
		var workbook = new Excel.Workbook();
		let sheet = workbook.addWorksheet(ITEMS);
		sheet.columns = await this.getHeaders();

		const fileName = 'items_imports_template.xlsx';
		await workbook.xlsx.writeFile(fileName);
		let path = appRoot.path + "/" + fileName;
		let base64 = await fs.readFileSync(path, { encoding: 'base64' });
		let uploadedFile = await this.uploadService.uploadFile(base64, fileName);

		await fs.unlinkSync(path);
		return { url: uploadedFile.url };
	}
}