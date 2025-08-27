import {
	Controller,
	Get,
	Post,
	Put,
	Param,
	Body,
	Query,
	Delete,
	UsePipes,
	ValidationPipe,
	UseGuards,
	NotFoundException,
	BadRequestException,
	UseInterceptors,
	UploadedFile
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from "@nestjs/platform-express";
import {
	User,
	ProductAdminList,
	QueryParams,
	ProductAdminOFSList,
	Message,
	ProductAdminDetail,
	ProductPayload,
	StatusPayload,
	ProductAdminSearch,
	ProductAdminOFS
} from 'src/shared/classes';
import { IProduct } from 'src/shared/models';
import { LocaleService, ExcelService, GetUser } from 'src/shared/services';
import { createSKU, validateAdminRole } from 'src/shared/util';
import { TypeAdminService } from '../type/type.service';
import { ProductAdminService } from './product.service';

/**
 * Product Admin Controller
 */
@Controller('/admin/products')
@UseGuards(AuthGuard('jwt'))
export class ProductAdminController {
  /**
	 * Constructor
	 * @param productService
	 * @param typeService
	 * @param localeService
	 * @param excelService
	 */
	constructor(
		private readonly productService: ProductAdminService,
		private readonly typeService: TypeAdminService,
		private readonly localeService: LocaleService,
		private readonly excelService: ExcelService,
	) { }

	/**
	 * Get all
	 * @param user
	 * @param query
	 * @returns
	 */
	@Get("/")
	async getAll(@GetUser() user: User, @Query() query: ProductAdminSearch): Promise<ProductAdminList> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const querySearch = await this.productService.validateAdminQuery(query);
		const product = await Promise.all([
			this.productService.getAll(querySearch),
			this.productService.countAll(querySearch)
		]);
		return { data: product[0], total: product[1] };
	}

	/**
	 * Get out of stocks product
	 * @param user
	 * @param query
	 * @returns
	 */
	@Get("/out-of-stocks")
	async getOutOfStocks(@GetUser() user: User, @Query() query: QueryParams): Promise<ProductAdminOFSList> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const querySearch = await this.productService.validateAdminQuery(query);
		const data = await Promise.all([
			this.productService.getOFS(querySearch),
			this.productService.countOFS()
		]);

		const products: ProductAdminOFS[] = [];
		data[0].forEach((p: IProduct) => {
			products.push({
				_id: p._id,
				title: p.title,
				capacity: p.variants[0].capacity,
				active: p.active
			});
		})

		return { data: products , total: data[1] };
	}

	/**
	 * Export product
	 * @param user
	 * @returns
	 */
	@Get("/exports")
	async exports(@GetUser() user: User): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const count = await this.productService.countAll({});
		if (!count)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const products = await this.productService.getAllExports(count);
		this.excelService.exportProducts(products);

		return { message: this.localeService.get('MSG_EXPORT_STARTED') };
	}

	/**
	 * Import product template
	 * @param user
	 * @returns
	 */
	@Get("/imports/template")
	async importTemplate(@GetUser() user: User): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const response = await this.excelService.createImportTemplate();
		return { message: response.url };
	}

	/**
	 * Get by id
	 * @param user
	 * @param productId
	 * @returns
	 */
	@Get("/:productId")
	async getById(@GetUser() user: User, @Param("productId") productId: number): Promise<ProductAdminDetail> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const product = await this.productService.getById(productId);
		if (!product) throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));
		return product;
	}

	/**
	 * Create
	 * @param user
	 * @param payload
	 * @returns
	 */
	@Post("/")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	private async create(@GetUser() user: User, @Body() payload: ProductPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		if (!payload.thumbnail)
			payload.thumbnail = payload.images[0];

		payload = await this.validateVariant(payload);
		payload = await this.validateType(payload);
		const product = await this.productService.create(payload);

		if (product && product._id)
			return { message: this.localeService.get('MSG_CREATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_CREATE_FAILURE'));
	}

	/**
	 * Update
	 * @param user
	 * @param productId
	 * @param payload
	 * @returns
	 */
	@Put("/:productId")
  @UsePipes(new ValidationPipe({ whitelist: true }))
	private async update(@GetUser() user: User, @Param("productId") productId: number, @Body() payload: ProductPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const productInfo = await this.productService.getById(productId);
		if (!productInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		payload = await this.validateVariant(payload);
		if (!payload.thumbnail)
			payload.thumbnail = payload.images[0];

		payload = await this.validateType(payload);
		const product = await this.productService.update(productId, payload);

		if (product.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Delete
	 * @param user
	 * @param productId
	 * @returns
	 */
	@Delete("/:productId")
	private async delete(@GetUser() user: User, @Param("productId") productId: number): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const productInfo = await this.productService.getById(productId);
		if (!productInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const product = await this.productService.delete(productId);
		if (product.deletedCount == 1)
			return { message: this.localeService.get('MSG_DELETE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_DELETE_FAILURE'));
	}

	/**
	 * Update status
	 * @param user
	 * @param productId
	 * @param payload
	 * @returns
	 */
	@Put("/:productId/status")
	@UsePipes(new ValidationPipe({ whitelist: true }))
	async updateStatus(@GetUser() user: User, @Param('productId') productId: number, @Body() payload: StatusPayload): Promise<Message> {
		if (!validateAdminRole(user.role)) throw new NotFoundException();

		const productInfo = await this.productService.getById(productId);
		if (!productInfo)
			throw new NotFoundException(this.localeService.get('MSG_NOT_FOUND'));

		const updateStatus = await this.productService.updateStatus(productId, payload);
		if (updateStatus.modifiedCount == 1)
			return { message: this.localeService.get('MSG_UPDATE_SUCCESS') };
		else
			throw new BadRequestException(this.localeService.get('MSG_UPDATE_FAILURE'));
	}

	/**
	 * Import products
	 * @param file
	 * @returns
	 */
	@Post('/imports')
  @UseInterceptors(FileInterceptor("file"))
	public async imports(@UploadedFile() file): Promise<Message> {
		if (file.mimetype !== 'application/vnd.ms-excel' && file.mimetype !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
			throw new BadRequestException(this.localeService.get('MSG_IMPORT_FILE_TYPE_ERROR'));

		const { updateList, createList } = await this.excelService.importProducts(file);
		this.productService.createAndUpdate(updateList, createList);
		return { message: this.localeService.get('MSG_IMPORT_STARTED') };
	}

	/**
	* Validate Variants and calculate discount
	* @param payload
	* @return ProductPayload - Updated payload
	*/
	private async validateVariant(product: ProductPayload): Promise<ProductPayload> {
		product.variants = product.variants.map(e => {
			e.sku = e.sku || createSKU(product.title, e.capacity);
			e.originalPrice = Math.round(e.originalPrice * 100) / 100;
			e.sellingPrice = Math.round(e.sellingPrice * 100) / 100;
			e.stock = Math.round(e.stock);
			if (e.originalPrice < e.sellingPrice)
				e.sellingPrice = e.originalPrice;
			if (e.originalPrice == e.sellingPrice)
				e.discount = 0;
			else
				e.discount = Number((((e.originalPrice - e.sellingPrice) / e.originalPrice) * 100).toFixed(0));
			return e;
		});
		return product;
	}

	/**
	* Validate cacke type
	* @param payload
	* @return ProductPayload - Updated payload
	*/
	private async validateType(payload: ProductPayload): Promise<ProductPayload> {
		const type = await this.typeService.getById(payload.type);
		if (!type)
			throw new BadRequestException(this.localeService.get('MSG_INVALID_TYPE'));

		return payload;
	}
}